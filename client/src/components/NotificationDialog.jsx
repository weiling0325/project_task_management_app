import { Avatar, Popover } from "@mui/material";
import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 100%;
  min-width: 300px;
  max-width: 400px;
  height: 500px;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 6px 2px;
  background-color: ${({ theme }) => theme.card};
`;

const Heading = styled.div`
  font-size: 22px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  margin: 4px 0px 12px 12px;
`;

const Item = styled.div`
  display: flex;
  gap: 10px;
  padding: 4px 12px 0px 12px;
`;

const Details = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0px 0px 0px 0px;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft};
`;

const Desc = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSoft + "99"};
`;

const Hr = styled.hr`
  background-color: ${({ theme }) => theme.soft + "99"};
  border: none;
  width: 100%;
  height: 1px;
  margin-top: 4px;
`;

const Body = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSoft + "99"};
`;


const NotificationDialog = ({open, id, anchorEl, handleClose, currentUser, notification}) => {
  console.log("NotificationDialog notification: ", notification);
  return (
    <Popover
      anchorReference="anchorPosition"
      open={open}
      onClose={handleClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      anchorPosition={{ top: 60, left: 1800 }}
    >
      <Wrapper>
        <Heading>Notifications</Heading>
        
        {Array.isArray(notification) && notification.length > 0 ? (
          notification.map((item, index) => (
            <Item key={index}>
              <Avatar sx={{ width: "32px", height: "32px" }}>
                {currentUser.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Details>
                <Title>{item.type}</Title>
                <Desc>{item.message}</Desc>
                <Hr />
              </Details>
            </Item>
          ))
        ) : (
          <Body>No notifications available.</Body>
        )}
      </Wrapper>
    </Popover>
  );
};

export default NotificationDialog;
