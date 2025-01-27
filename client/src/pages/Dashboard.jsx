
import React from "react";
import { useState, useEffect } from "react";
import ProjectCard from "../components/ProjectCard";
import Styled, { useTheme } from "styled-components";
import { Add } from "@mui/icons-material";
import CircularProgress from '@mui/material/CircularProgress';
import { useSelector } from "react-redux";
import { LinearProgress } from "@mui/material";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";
import { getUserProject, getUserTask } from "../api/index";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import AddNewProject from "../components/AddNewProject";

const Container = Styled.div`
@media screen and (max-width: 480px) {
  padding: 10px 10px;
}
`;

const Section = Styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
`;

const Left = Styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  gap: 20px;
  flex: 1.4;
`;

const Right = Styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: start;
  gap: 20px;
`;

const TopBar = Styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  gap: 16px;
  margin: 20px 0px;
`;

const CreateButton = Styled.div`
  padding: 20px 30px;
  text-align: left;
  font-size: 16px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  border-radius: 12px;
  background: linear-gradient(76.35deg, #306EE8 15.89%, #306EE8 89.75%);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.5s ease;
  &:hover {
    background: linear-gradient(76.35deg, #306EE8 15.89%, #306EE8 89.75%);
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.25);
  }
  gap: 14px;

  ${({ btn }) =>
    btn === "team" &&
    `
    background: linear-gradient(76.35deg, #FFC107 15.89%, #FFC107 89.75%);
    &:hover {
      background: linear-gradient(76.35deg, #FFC107 15.89%, #FFC107 89.75%);
      box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.25);
    }
  `}
`;

const Icon = Styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.primary};
  border-radius: 50%;
  padding: 4px;
`;

const StatsWrapper = Styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(250px, 1fr));
  grid-gap: 24px;
  margin: 20px 0px;
`;

const StatCard = Styled.div`
  width: 100%;
  height: 100%;
  padding: 4px;
  text-align: left;
  margin: 2px;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.card};
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.20);
  transition: all 0.5s ease;
  &:hover {
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.25);
  }
`;

const RecentProjects = Styled.div`
  width: 100%;
  height: 100%;
  text-align: left;
  margin: 2px;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  border-radius: 12px;
`;

const SectionTitle = Styled.div` 
  width: 100%;
  padding: 0px 12px;
  font-size: 22px;
  font-weight: 600;
  margin: 10px 0px 16px 0px;
  color: ${({ theme }) => theme.text};
`;

const TotalProjects = Styled.div` 
  width: 100%;
  padding: 8px 12px;
`;

const TaskCompleted = Styled.div` 
  width: 100%;
  padding: 8px 12px;
`;

const Progress = Styled.div`
  width: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 10px 0px 0 0;
`;

const ProgressText = Styled.div`
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const Desc = Styled.div`
  font-size: 12px;
  font-weight: 500;
  padding: 0px 4px;
  line-spacing: 1.5;
  font-size: 13px;
  color: ${({ theme }) => theme.soft2};
`;

const Title = Styled.div`
  width: 100%;
  height: 100%;
  text-align: left;
  margin: 2px;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const Span = Styled.span`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.primary};
`;

const Dashboard = ({ setNewProject, newProject, setRefreshMenu }) => {

  const dispatch = useDispatch();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [totalProjectsDone, setTotalProjectsDone] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalTasksDone, setTotalTasksDone] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useSelector((state) => state.user);

  const token = localStorage.getItem("token");

  const getTotalProjectsDone = (fetchedProjects) => {
    setTotalProjectsDone(
      fetchedProjects.filter((project) => project.project_status.toString() === "Completed").length
    );
    setTotalProjects(fetchedProjects.length);
  };
  
  const getTotalTasks = (fetchedTasks) => {
    const completedTasks = fetchedTasks.filter(
      (task) => task.task_status.toString().toLowerCase() === "completed"
    ).length;
    setTotalTasks(fetchedTasks.length);
    setTotalTasksDone(completedTasks);
  };

  const fetchAllData = async() => {
    try {
      const [projectRes, taskRes] = await Promise.all([
        getUserProject(token),
        await getUserTask(token)
      ]);
      const fetchedProjects = projectRes.data.projects;
      setProjects(fetchedProjects);
      getTotalProjectsDone(fetchedProjects); 

      const fetchedTasks = taskRes.data.data; 
      setTasks(fetchedTasks); 
      getTotalTasks(fetchedTasks);
    }catch (err) {
      console.error("Error fetching data:", err);
      dispatch(
        openSnackbar({
          message: err.response?.data?.message || "Failed to load data.",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllData();
    window.scrollTo(0, 0);
  }, [newProject]);

  useEffect(()=> {
    fetchAllData();
  },[])


  return (
    <Container>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '12px 0px', height: '300px' }}>
          <CircularProgress />
        </div>
      ) : (
        <Section>
          <Left>
            <StatsWrapper>
              <StatCard>
                <TotalProjects>
                  <Title>Total Projects Done</Title>
                  <Progress>
                    <LinearProgress
                      sx={{
                        borderRadius: "10px", height: 7, width: "80%"
                      }}
                      variant="determinate"
                      value={
                        totalProjectsDone === 0
                          ? 0
                          : (totalProjectsDone / totalProjects) * 100
                      }
                    />
                    <ProgressText>{totalProjectsDone.toString()}</ProgressText>
                  </Progress>
                  <Desc>Working on&nbsp;
                    <Span> {(totalProjects - totalProjectsDone).toString()} </Span>
                    &nbsp;projects</Desc>
                </TotalProjects>
              </StatCard>

              <StatCard>
                <TaskCompleted>
                  <Title>Total Task Done</Title>
                  <Progress>
                    <LinearProgress
                      sx={{ borderRadius: "10px", height: 7, width: "80%" }}
                      variant="determinate"
                      value={
                        totalTasksDone === 0
                          ? 0
                          : (totalTasksDone / totalTasks) * 100
                      }
                      color={"success"}
                    />
                    <ProgressText>{totalTasksDone}</ProgressText>
                  </Progress>
                  <Desc><Span>{totalTasks ? totalTasks - totalTasksDone : 0}</Span> &nbsp;Tasks are left</Desc>
                </TaskCompleted>
              </StatCard>            
            </StatsWrapper>

            <RecentProjects>
              <SectionTitle>Recent Projects</SectionTitle>
              <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 2 }}>
                <Masonry gutter="0px 16px">
                  {
                    projects
                      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                      .filter((item, index) => index < 6)
                      .map((project, id) => (
                        <ProjectCard
                          key={project._id}
                          item={project}
                          index={id}
                        />
                      ))
                  }
                </Masonry>
              </ResponsiveMasonry>
            </RecentProjects>

          </Left>
          <Right>

            <TopBar>
              <CreateButton onClick={() => { setNewProject(true); }}>
                <Icon>
                  <Add style={{ color: 'inherit' }} />
                </Icon>
                Create New Project
              </CreateButton>
            </TopBar>
          </Right>
          {newProject && (
            <AddNewProject
              setNewProject={setNewProject}
              setRefreshMenu={setRefreshMenu}
            />
          )}
        </Section>
      )}
    </Container >
  );
};

export default Dashboard;
