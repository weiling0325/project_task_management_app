import React, { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components";
import { CircularProgress } from "@mui/material";
import { openSnackbar } from "../redux/snackbarSlice";
import { useDispatch } from "react-redux";
import { getUserTeam } from "../api/index";
import TeamOverviewCard from "../components/TeamOverviewCard";

const Container = styled.div`
  padding: 14px 14px;
  @media screen and (max-width: 480px) {
    padding: 10px 10px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Team = styled.div`
  width: 100%;
  text-align: left;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  border-radius: 12px;
`;

const SectionTitle = styled.div`
  width: 100%;
  padding: 0px 12px;
  font-size: 22px;
  font-weight: 600;
  margin: 16px 0px 0px;
  color: ${({ theme }) => theme.text};
`;
const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: start;
`;

const CardContainer = styled.div`
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 12px;
  padding: 10px;
  width: calc((100% - 20px) / 3); /* Three cards per row with 10px gap */
  min-height: 150px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: left;

  &:hover {
    transform: scale(1.02);
  }

  @media screen and (max-width: 900px) {
    width: calc((100% - 10px) / 2); /* Two cards per row */
  }

  @media screen and (max-width: 480px) {
    width: 100%; 
  }
`;

const Null = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSoft};
  padding: 0px 12px;
  margin: 16px 0px 0px;
`;


const Teams = () => {
  const [item, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  
  const fetchData = async () => {
    try {
      const res = await getUserTeam(token); 
      if (res.status === 200) {
        console.log("Teams fetchData res.data.data", res.data.data);
        setItems(res.data.data); 
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching team details:", err.message || err);
      dispatch(
        openSnackbar({
          message: err.response?.data?.message || "Failed to fetch team details",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);


  return (
    <Container>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '12px 0px', height: '300px' }}>
          <CircularProgress />
        </div>
      ) : (
        <Section>
          <Team>
            <SectionTitle>Teams</SectionTitle>
            <CardGrid>
              {item.length > 0 ? (
                item.map((team) => (
                <CardContainer key={team.id}>
                  <TeamOverviewCard item={team} />
                </CardContainer>
              ))
            ): 
                (
                <Null>No team found</Null>
                )}
            </CardGrid>
          </Team>
        </Section>
      )}
    </Container>
  );
}

export default Teams;
