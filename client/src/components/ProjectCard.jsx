import React from "react";
import { Fragment, useRef } from "react";
import styled from "styled-components";
import { TimelapseRounded } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import {format} from 'timeago.js';
import Tooltip from "@mui/material/Tooltip";
import {formatDate} from '../api/utils';

const Container = styled.div`
  padding: 14px 14px;
  text-align: left;
  margin: 12px 0px 8px 0px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.09);
  &:hover {
    transition: all 0.6s ease-in-out;
    box-shadow: 0 0 18px 0 rgba(0, 0, 0, 0.5);
  }
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft};
  margin-top: 6px;
  flex: 7;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Desc = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.soft2};
  margin-top: 8px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 5; /* number of lines to show */
  line-clamp: 5;
  -webkit-box-orient: vertical;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0px;
`;

const Time = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.soft2 + "99"};
`;

const AvatarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DateInfo = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
  margin-top: 6px;
`;

const Status = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  padding: 4px 8px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.soft2 + "22"};
`;

const ProjectCard = ({ item }) => {
  const ref = useRef(null);

  return (
    <Link to={`/project/${item._id}`} style={{ textDecoration: "none" }}>
      <Fragment>
        <Container ref={ref} className={"item"}>
          <Top>
            <Title>{item.project_name}</Title>
            <Status>{item.project_status}</Status>
          </Top>
          <Desc>{item.project_description}</Desc>
          <DateInfo>
            Start: {formatDate(item.start_date)} | End: {formatDate(item.end_date)}
          </DateInfo>
          <Bottom>
            <Time>
              <TimelapseRounded sx={{fontSize: '18px'}}/> Updated {format(item.updatedAt)}
            </Time>
            <AvatarGroup>
              {item.assign_to?.member?.user.account.map((account) => (
                <Tooltip
                  key={account.id._id}
                  title={`${account.name} (${account.email})`}
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
                    {account.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </Bottom>
        </Container>
      </Fragment>
    </Link>
  );
};

export default ProjectCard;
