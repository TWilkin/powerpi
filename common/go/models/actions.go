package models

type ActionType string

const (
	ActionError  ActionType = "error"
	ActionChange ActionType = "change"
	ActionStatus ActionType = "status"
)
