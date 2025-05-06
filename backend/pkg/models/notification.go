package Models

import (
	"time"
)

type Notification struct {
	Id int
	SenderId int `json:"senderId"`
	TargetId int `json:"targetId"`
	Type    int `json:"type"`
	Accepted  bool `json:"accepted"`
	Viewed bool   `json:"viewed"`
	CreatedDate  time.Time
}

type AddMembers struct {
	User User
	MemberId int
	Status int
	GroupId int
	GroupName string
}

type Membership struct {
	User User
	Status int
	GroupId int
	GroupName string
}

type EventNotif struct {
	User User
	Event EventDetails
}