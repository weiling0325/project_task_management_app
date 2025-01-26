import React from "react";
import styled from "styled-components";
import { tagColors } from "../data/data";
import { useState, useEffect } from "react";
import { Avatar } from "@mui/material";

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

const Role = styled.div`
  background-color: ${({ theme }) => theme.bgDark};
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: left;
  justify-content: center;
`;

const Null = styled.div`
  padding: 12px 10px;
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSoft};
  margin: 5px 20px 0px 0px;
`;

const MemberDetails = styled.div`
  margin: 0px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.bgDark + "98"};
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
`;

const Card = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.8fr 0.5fr; 
  align-items: center;
  padding: 12px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.soft + "66"};
`;

const UserData = styled.div`
  flex: ${({ width }) => width || "1"};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Table = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const TableHeader = styled.div`
  margin-top:10px;
  display: grid;
  grid-template-columns: 1fr 0.8fr 0.5fr; 
  align-items: center;
  padding: 10px 10px;
  gap: 8px;
  border-radius: 8px 8px 0px 0px;
  border: 1.8px solid ${({ theme }) => theme.soft + "99"};
  background-color: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.bgDark + "98"};
`;

const TableHeaderContent = styled.div`
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: ${({ theme }) => theme.soft2};
`;

  const MemberCard = ({ team, children }) => {
    const [members, setMembers] = useState([]);
    const randomTagColor = tagColors[Math.floor(Math.random() * tagColors.length)];

    useEffect(() => {
      if (team) {
        setMembers(team.member);
      }
    }, [team]);

  return (
    <MemberDetails>
    <Table>
      <TableHeader>
        <TableHeaderContent >Members</TableHeaderContent>
        <TableHeaderContent>Member Role</TableHeaderContent>
        <TableHeaderContent>Allow to Modify</TableHeaderContent>
      </TableHeader>
    <UsersList>
      {members.length > 0 ? (
        members.sort((a, b) => a.user.name.localeCompare(b.user.name)).map((member) => (
          <Card key="member.user._id">
          <UserData width="1">
            <Avatar
              sx={{ width: "34px", height: "34px" }}
            >
              {member.user.account.name.charAt(0).toUpperCase() || "?"}
            </Avatar>
            <Details>
              <Name>{member.user.account.name || "Unknown"}</Name>
              <EmailId>{member.user.account.email || "No email"}</EmailId>
            </Details>
          </UserData>
          <Role tagColor={randomTagColor}>{member.member_role || "No role"}</Role>
          <Role>{member.allow_to_modify ? "Yes" : "No"}</Role>
        </Card>
        ))
      ) : (
        <Null>No members found</Null>
      )}
    </UsersList>    
    {children}
    </Table>  
    
  </MemberDetails>
        
  );
}; 

export default MemberCard;
