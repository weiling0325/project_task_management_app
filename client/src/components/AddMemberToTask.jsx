import { IconButton, Modal } from "@mui/material";
import { Avatar } from "@mui/material";
import { CloseRounded } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { tagColors } from "../data/data";

const AddMemberWrappper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #000000a7;
  display: flex;
  justify-content: center;
`;

const FlexDisplay = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
`;

const Body = styled.div`
  width: 100%;
  height: min-content;
  margin: 2%;
  max-width: 300px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.bgLighter};
  color: ${({ theme }) => theme.text};
  padding: 10px;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Title = styled.div`
  font-size: 22px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  margin: 12px 20px;
`;

const UsersList = styled.div`
  padding: 18px 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: 12px;
  color: ${({ theme }) => theme.textSoft};
`;

const MemberCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
`;
const UserData = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Details = styled.div`
  gap: 4px;
`;

const Name = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft};
`;

const EmailId = styled.div`
  font-size: 10px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSoft + "99"};
`;

const InviteButton = styled.button`
  padding: 6px 14px;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.primary};
  border-radius: 1px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  border-radius: 10px;
  transition: all 0.3s ease;
  &:hover {
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text};
  }
`;

const Null = styled.div`
  font-size: 12px;
  font-weight: 400;
  margin: 0px 20px;
  color: ${({ theme }) => theme.textSoft + "99"};
`;

const AddMemberToTask = ({ project_member, setOpenSelectMemberPopUp, setSelectMember }) => {
  const randomTagColor = tagColors[Math.floor(Math.random() * tagColors.length)];

  const addSelectedMember= (selectedMember) => {
    setSelectMember((prev) => {
      const isAlreadyAdded = prev.some((member) => member._id === selectedMember._id);
      return isAlreadyAdded ? prev : [...prev, selectedMember];
    });
    setOpenSelectMemberPopUp(false);
  }


    return (
        <Modal open={true} onClose={() => setOpenSelectMemberPopUp(false)}>
            <AddMemberWrappper>
                <Body>
                    <FlexDisplay>
                        <IconButton
                            style={{
                                position: "absolute",
                                right: "10px",
                                cursor: "pointer",
                                color: "inherit",
                            }}
                            onClick={() => setOpenSelectMemberPopUp(false)}
                        >
                            <CloseRounded style={{ color: "inherit" }} />
                        </IconButton>
                        <Title style={{ paddingLeft: "10px" }}>Select member</Title>
                    </FlexDisplay>
                    <UsersList>
                      {project_member.length > 0 ? (
                        project_member.map((user) => (
                          
                            <MemberCard key={user._id}>
                                <UserData>
                                    <Avatar sx={{ width: "34px", height: "34px" }} >
                                        {user.account.email[0].toUpperCase()}
                                    </Avatar>
                                    <Details>
                                        <Name>{user.account.name}</Name>
                                        <EmailId>{user.account.email}</EmailId>
                                    </Details>
                                </UserData>
                                <InviteButton onClick={() => addSelectedMember(user)}>Add</InviteButton>
                            </MemberCard>
                          ))
                        ) : (
                            <Null>No member found</Null>
                          )} 
                    </UsersList>
                </Body>
            </AddMemberWrappper>
        </Modal>
    )
}

export default AddMemberToTask;