'use client';
import React from "react";
import { useState, useEffect } from "react";
import {
  acceptFollow,
  getAllNotifs,
  declineFollow,
  getAddMemberNotifs,
  getRequestMembershipNotifs,
  getEventNotifs
} from "@/ComponentDatas/retrieveNotifications"
import { useRouter } from "next/navigation";
import {
  Image,
  Text,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  Card,
  CardBody,
  Stack,
  transform
} from '@chakra-ui/react';
import { CheckCircleIcon, DeleteIcon } from '@chakra-ui/icons'
import styles from '../app/styles/notif.module.css'
import { useGetData } from "@/useRequest";

export default function Notification() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()
  const [followData, setFollowData] = useState([])
  const [themeColor, setThemeColor] = useState(null);
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setThemeColor(theme);
  }, []); 
  const useGet = useGetData(`/api/data/followersNotifs`)
  // console.log("getuu", useGet);
  useEffect(() =>{
    // console.log("datas udes", useGet.datas);
    setFollowData(useGet.datas);

  },  useGet.datas)

  const [addMemberData, setAddMemberData] = useState([])
  const useGet2 =  useGetData(`/api/data/addMembersNotifs`)
  useEffect(() =>{
    // console.log("datas udes", useGet2.datas);
    setAddMemberData(useGet2.datas);

  },  useGet2.datas)
  const [membershipData, setMembershipData] = useState([])

  const useGet3 =  useGetData(`/api/data/requestMembershipNotifs`)
  useEffect(() =>{
    // console.log("datas udesssss3", useGet3.datas);
    setMembershipData(useGet3.datas);

  },  useGet3.datas)

  const [eventData, setEventsData] = useState([])

  const useGet4 =  useGetData(`/api/data/getEventNotifs`)
  useEffect(() =>{
    setEventsData(useGet4.datas);
    
  },  useGet4.datas)
  // console.log("datas userEvents", useGet4.datas);

  return (
    <>
      <button ref={btnRef} onClick={onOpen}>
        <img src="../notification_icon.svg" style={{ width: "94%" }}/>
      </button>
      <Drawer
        isOpen={isOpen}
        placement='left'
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent className={'Container_OF_contant'} background={themeColor == "light" ? "#fff" : "#000"} overflowY={'scroll'} color={'burlywood'}>
          <DrawerCloseButton />
          <DrawerHeader>Notifications</DrawerHeader>
          {followData && followData.map((user, index) => (
            <NotifFollow
              dataNotif={user.Use}
              key={index} />
          ))}
          {addMemberData && addMemberData.map((user, index) => (
            <NotifInvitation
              dataNotif={user.User}
              groupName={user.GroupName}
              groupId={user.GroupId}
              key={index} />
          ))}
          {membershipData && membershipData.map((user, index) => (
            <NotifJoinGroup
              dataNotif={user.User}
              groupName={user.GroupName}
              groupId={user.GroupId}
              key={index} />
          ))}
          {eventData && eventData.map((user, index) => (
            <NotifEvent
              dataNotif={user.User}
              eventUser={user.Event}
              key={index} />
          ))}
        </DrawerContent>
      </Drawer>
    </>
  )
}
export function NotifFollow({ dataNotif }) {
  const data = {
    'followerId': dataNotif.Id
  }
  return (
    <>
      <Card height='5rem' mt='.8rem' maxW='none' bg='#60696a' className={styles.cardAnime}>
        <CardBody style={{ display: 'flex', marginTop: '-1rem' }}>
          <Image
            maxW='25%'
            height='4rem'
            ml='-5.3%'
            src='../cad.jpg'
            alt=''
            borderRadius='full'
          />
          <Stack>
            <Text color='whitesmoke' style={{ width: '160px', textWrap: 'wrap', textAlign: 'center' }}>
              {`${dataNotif.FirstName} ${dataNotif.LastName}`}, wants to follow to you.
            </Text>
          </Stack>
          <Stack display='flex' flexDirection='column' alignItems='center' className={styles.actionBnt}>
            <CheckCircleIcon variant='solid' color='#0ee10e' height='2rem' mb='.5rem' width='80%' className={styles.bntBehave} onClick={() => acceptFollow("updateFollower", data)} />
            <DeleteIcon variant='solid' color='red' height='2rem' width='80%' className={styles.bntBehave} onClick={() => declineFollow('deleteFollow', data)} />
          </Stack>
        </CardBody>
      </Card>
    </>
  )
}
export function NotifEvent({ dataNotif, eventUser }) {
  const router = useRouter();
  return (
    <>
      <Card height='5rem' mt='.8rem' maxW='auto' bg='#60696a' className={styles.cardAnime} _hover={{ cursor: 'pointer' }} onClick={() => router.push(`/groups/${eventUser.groupId}`)}>
        <CardBody style={{ display: 'flex', marginTop: '-1rem', textAlign: 'center' }}>
          <Image
            maxW='25%'
            height='4rem'
            ml='-5.3%'
            src='../cad.jpg'
            alt=''
            borderRadius='full'
          />
          <Stack>
            <Text color='whitesmoke' style={{ width: 'auto', textWrap: 'wrap' }}>
              <input type="hidden" name="eventId" value={eventUser.id}></input>
              {`${dataNotif.FirstName} ${dataNotif.LastName}`}, has created the <strong style={{ color: 'gold' }}>{eventUser.title}</strong> event.
              For more details click on it!
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </>
  )
}
export function NotifInvitation({ dataNotif, groupName, groupId }) {
  const data = {
    'addMemberId': dataNotif.Id,
    'groupId': groupId
  }
  return (
    <>
      <Card height='5rem' mt='.8rem' maxW='none' bg='#60696a' className={styles.cardAnime}>
        <CardBody style={{ display: 'flex', marginTop: '-1rem' }}>
          <Image
            maxW='25%'
            height='4rem'
            ml='-5.3%'
            src='../cad.jpg'
            alt=''
            borderRadius='full'
          />
          <Stack>
            <Text color='whitesmoke' style={{ width: '160px', textWrap: 'wrap', textAlign: 'center' }}>
              {`${dataNotif.FirstName} ${dataNotif.LastName}`}, has invited you to join the <strong style={{ color: 'rgb(16 16 16)' }}>{groupName}</strong> group.
            </Text>
          </Stack>
          <Stack display='flex' flexDirection='column' alignItems='center' className={styles.actionBnt}>
            <CheckCircleIcon variant='solid' color='#0ee10e' height='2rem' mb='.5rem' width='80%' className={styles.bntBehave} onClick={() => acceptFollow("updateAddMember", data)} />
            <DeleteIcon variant='solid' color='red' height='2rem' width='80%' className={styles.bntBehave} onClick={() => declineFollow('deleteAddMember', data)} />
          </Stack>
        </CardBody>
      </Card>
    </>
  )
}
export function NotifJoinGroup({ dataNotif, groupName, groupId }) {
  const data = {
    'membershipId': dataNotif.Id,
    'groupIdMembership': groupId
  }
  return (
    <>
      <Card height='5rem' mt='.8rem' maxW='none' bg='#60696a' className={styles.cardAnime}>
        <CardBody style={{ display: 'flex', marginTop: '-1rem' }}>
          <Image
            maxW='25%'
            height='4rem'
            ml='-5.3%'
            src='../cad.jpg'
            alt=''
            borderRadius='full'
          />
          <Stack>
            <Text color='whitesmoke' style={{ width: '160px', textWrap: 'wrap', textAlign: 'center' }}>
              {`${dataNotif.FirstName} ${dataNotif.LastName}`}, wants to join the <strong style={{ color: 'rgb(16 16 16)' }}>{groupName}</strong> group.
            </Text>
          </Stack>
          <Stack display='flex' flexDirection='column' alignItems='center' className={styles.actionBnt}>
            <CheckCircleIcon variant='solid' color='#0ee10e' height='2rem' mb='.5rem' width='80%' className={styles.bntBehave} onClick={() => acceptFollow("updateMembership", data)} />
            <DeleteIcon variant='solid' color='red' height='2rem' width='80%' className={styles.bntBehave} onClick={() => declineFollow('deleteMembership', data)} />
          </Stack>
        </CardBody>
      </Card>
    </>
  )
}