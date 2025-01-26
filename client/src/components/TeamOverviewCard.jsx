import React from "react";
import { Fragment, useRef } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

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
  -webkit-line-clamp: 2; 
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
  -webkit-line-clamp: 5; 
  line-clamp: 5;
  -webkit-box-orient: vertical;
`;

const DateInfo = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
  margin-top: 6px;
`;

const TeamOverviewCard = ({ item }) => {
  const ref = useRef(null);

  return (
    <Link to={`/team/${item._id}`} style={{ textDecoration: "none" }}>
      <Fragment>
        <Container ref={ref} className={"item"}>
          <Top>
            <Title>{item.team_name}</Title>
          </Top>
          <DateInfo>{item.team_role}</DateInfo>
          <Desc>{item.team_role}</Desc>
          
        </Container>
      </Fragment>
    </Link>
  );
};

export default TeamOverviewCard;
