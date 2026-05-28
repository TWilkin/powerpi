class SubsetMatcher:
    '''
    A test matcher which will ensure the expected is a subset of the comparison dictionary.
    '''

    def __init__(self, expected: dict):
        self.__expected = expected

    def __eq__(self, other: dict):
        return self.__expected.items() <= other.items()
