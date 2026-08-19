class DimensionMismatchError(ValueError):
    def __init__(self, expected: int, got: int) -> None:
        self.expected = expected
        self.got = got
        super().__init__(f"Embedding dimension mismatch: expected {expected}, got {got}")


class NotFoundError(LookupError):
    pass
