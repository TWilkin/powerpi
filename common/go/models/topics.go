package models

type ActionType string

const (
	ActionCapability ActionType = "capability"
	ActionChange     ActionType = "change"
	ActionError      ActionType = "error"
	ActionStatus     ActionType = "status"
)

type TopicType string

const (
	TopicConfig TopicType = "config"
	TopicDevice TopicType = "device"
	TopicEvent  TopicType = "event"
)
