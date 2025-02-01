import axios from "axios";
import React from "react";
import { useState, useEffect } from "react";
import styled from "styled-components";
import ProjectCard from "../components/ProjectCard";
import { statuses, tagColors } from "../data/data";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";
import { useSelector } from "react-redux";
import { getUserProject } from "../api/index";
import { CircularProgress } from "@mui/material";

const Container = styled.div`
  width: 100%;
`;

const Column = styled.div`
  display: flex;
  flex-direction: row;
  @media screen and (max-width: 480px) {
    flex-direction: column;
  }
  justify-content: space-between;
  margin: 12px 0px;
`;
const ItemWrapper = styled.div`
  width: 100%;
  height: 100%;
  @media screen and (max-width: 480px) {
    width: 97%;
  }
  padding: 4px;
  text-align: left;
  margin: 2px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const Span = styled.span`
  color: ${({ theme }) => theme.soft2};
  font-weight: 400;
  margin-left: 8px;
`;

const Wrapper = styled.div`
  padding: 12px 6px;
`;

const OutlinedBox = styled.div`
  min-height: 44px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.soft2};
  color: ${({ theme }) => theme.text};
  ${({ googleButton, theme }) =>
    googleButton &&
    `
    user-select: none; 
  gap: 16px;`}
  ${({ button, theme }) =>
    button &&
    `
    user-select: none; 
  border: none;
    font-weight: 600;
    font-size: 16px;
    background: linear-gradient(76.35deg, #306EE8 15.89%, #306EE8 89.75%); `}
    ${({ activeButton, theme }) =>
    activeButton &&
    `
    user-select: none; 
  border: none;
    background: ${theme.primary};
    color: white;`}
    margin-top: 8px;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 14px;
  &:hover {
    transition: all 0.6s ease-in-out;
    background: linear-gradient(76.35deg, #306EE8 15.89%, #306EE8 89.75%);
    color: white;
  }
`;

const Projects = ({ newProject,setNewProject }) => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useSelector((state) => state.user);

  const token = localStorage.getItem("token");
  const getprojects = async () => {
    await getUserProject(token)
      .then((res) => {
        setData(res.data.projects);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        dispatch(
          openSnackbar({
            message: err.response.data.message,
            type: "error",
          })
        );
      });
  };

  useEffect(() => {
    getprojects();
    window.scrollTo(0, 0);
  }, [newProject]);


  return (
    
    <Container>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '12px 0px', height: '300px' }}>
          <CircularProgress />
        </div>
      ) : (
        <Column>
          {statuses.map((s, index) => {
            return (
              <ItemWrapper key={index}>
                {s.icon} {s.status}
                <Span>
                  ({data.filter((item) => item.project_status == s.status).length})
                </Span>
                <Wrapper key={index}>
                  {s.status === "Working" && (
                    <OutlinedBox button={true} activeButton={false} onClick={() => setNewProject(true)}>
                      Create New Project
                    </OutlinedBox>
                  )}
                  {data
                    .filter((item) => item.project_status == s.status)
                    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                    .map((item, idx) => (
                      <ProjectCard
                        key={item._id}
                        item={item}
                        index={idx}
                        status={s}
                        tagColor={tagColors[3]}
                      />
                    ))}
                </Wrapper>
              </ItemWrapper>
            );
          })}
        </Column>
      )}
    </Container>
  );
};

export default Projects;
