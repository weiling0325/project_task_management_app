import React from "react";
import styled from "styled-components";
import { tagColors } from "../data/data";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";

const Container = styled.div`
  padding: 2px 4px;
  text-align: left;
  margin: 0px 0px 0px 0px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Name = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft};
`;

const Role = styled.div`
  font-size: 10px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  color: ${({ tagColor, theme }) => tagColor + theme.lightAdd};
  background-color: ${({ tagColor, theme }) => tagColor + "10"};
`;

const AvatarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto; 
`;

const TeamCard = ({ team, children, onClick }) => {
  const randomTagColor = tagColors[Math.floor(Math.random() * tagColors.length)];
  return (
    <Container onClick={onClick} style={{ cursor: "pointer" }}>
      <Wrapper>
        <Details>
          <Name>{team.team_name}</Name>
        </Details>
        <Role tagColor={randomTagColor}>{team.team_role}</Role>
        <AvatarGroup>
          {team?.members?.map((member) => (
            <Tooltip
              key={member.id._id}
              title={`${member.id.name} (${member.id.email})`}
              arrow
            >
              <Avatar
                sx={{
                  width: "34px",
                  height: "34px",
                  fontSize: "14px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                }}
              >
                {member.id.name.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
        <ButtonGroup>{children}</ButtonGroup>
      </Wrapper>
    </Container>
  );
};

export default TeamCard;
