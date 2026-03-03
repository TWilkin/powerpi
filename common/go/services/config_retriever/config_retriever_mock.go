package configretriever

import "github.com/stretchr/testify/mock"

type MockConfigRetriever struct {
	mock.Mock
}

func (retriever *MockConfigRetriever) WaitForConfig() {
	retriever.Called()
}
