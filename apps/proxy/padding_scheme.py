import hashlib
import random
import time


DEFAULT_SCHEME = """stop=8
0=30-30
1=100-400
2=400-800,c,500-1000,c,500-1000
3=9-9,500-1000
4=500-1000
5=500-1000
6=500-1000
7=500-1000"""


class PaddingSchemeGenerator:
    def generate(self, rotation_hours: int = 1) -> str:
        seed = self._get_seed(rotation_hours)

        for attempt in range(5):
            rng = random.Random(seed + attempt)
            stop = self._generate_stop(rng)
            lines = [f"stop={stop}", self._generate_pkt0(rng), self._generate_pkt1(rng), self._generate_pkt2(rng)]
            lines.extend(self._generate_pkt_n(rng, n) for n in range(3, stop))
            scheme = "\n".join(lines)

            if self._validate(scheme):
                return scheme

        return DEFAULT_SCHEME

    def _get_seed(self, rotation_hours) -> int:
        hours = max(1, int(rotation_hours))
        window = int(time.time() // (hours * 3600))
        digest = hashlib.sha256(str(window).encode()).hexdigest()
        return int(digest, 16)

    def _generate_stop(self, rng: random.Random) -> int:
        roll = rng.randint(1, 100)
        if roll <= 60:
            return rng.randint(6, 10)
        if roll <= 85:
            return rng.randint(3, 5)
        return rng.randint(11, 15)

    def _generate_pkt0(self, rng) -> str:
        min_value = rng.randint(20, 50)
        max_value = rng.randint(min_value, min(min_value + 40, 80))
        return f"0={min_value}-{max_value}"

    def _generate_pkt1(self, rng) -> str:
        min_value = rng.randint(80, 200)
        max_value = rng.randint(250, 600)
        return f"1={min_value}-{max_value}"

    def _generate_pkt2(self, rng) -> str:
        segments = []
        segment_count = rng.randint(3, 5)

        for index in range(segment_count):
            if index == 0:
                min_value = rng.randint(250, 700)
            else:
                min_value = rng.randint(400, 1400)
            max_value = rng.randint(min_value, 1500)
            segments.append(f"{min_value}-{max_value}")

        return "2=" + ",c,".join(segments)

    def _generate_pkt_n(self, rng, n: int) -> str:
        roll = rng.randint(1, 100)

        if roll <= 60:
            min_value = rng.randint(400, 1400)
            max_value = rng.randint(min_value, 1500)
            value = f"{min_value}-{max_value}"
        elif roll <= 85:
            first_min = rng.randint(200, 900)
            first_max = rng.randint(first_min, 1500)
            second_min = rng.randint(400, 1400)
            second_max = rng.randint(second_min, 1500)
            value = f"{first_min}-{first_max},c,{second_min}-{second_max}"
        else:
            small = rng.randint(8, 32)
            big_min = rng.randint(400, 1400)
            big_max = rng.randint(big_min, 1500)
            value = f"{small}-{small},{big_min}-{big_max}"

        return f"{n}={value}"

    def _validate(self, scheme: str) -> bool:
        lines = [line.strip() for line in scheme.splitlines() if line.strip()]
        values = {}

        for line in lines:
            if "=" not in line:
                return False

            key, value = line.split("=", 1)
            values[key] = value

        if "stop" not in values or "0" not in values:
            return False

        try:
            stop = int(values["stop"])
        except ValueError:
            return False

        if stop < 2 or stop > 20:
            return False

        if "c" in values["0"].split(","):
            return False

        for key, value in values.items():
            if key == "stop":
                continue

            if "c,c" in value or value.startswith("c") or value.endswith("c"):
                return False

            for part in value.split(","):
                if part == "c":
                    continue

                if "-" not in part:
                    return False

                min_text, max_text = part.split("-", 1)

                try:
                    min_value = int(min_text)
                    max_value = int(max_text)
                except ValueError:
                    return False

                if min_value > max_value or max_value > 1500:
                    return False

        return True
