package models

type FileType string

const (
	Devices   FileType = "devices"
	Events    FileType = "events"
	Floorplan FileType = "floorplan"
	Schedules FileType = "schedules"
	Users     FileType = "users"
)

var FileTypes = []FileType{Devices, Events, Floorplan, Schedules, Users}
