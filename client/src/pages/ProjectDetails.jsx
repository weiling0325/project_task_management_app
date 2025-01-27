import React, { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { Delete, Edit, PersonAdd } from "@mui/icons-material";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { CircularProgress, IconButton } from "@mui/material";
import { openSnackbar } from "../redux/snackbarSlice";
import { useDispatch } from "react-redux";
import { getProject, getProjectTask, getProjectMember } from "../api/index";
import AddTask from "../components/AddTask";
import UpdateProject from "../components/UpdateProject";
import DeletePopup from "../components/DeletePopup";
import AddNewTeam from "../components/AddNewTeam";
import UpdateTeam from "../components/UpdateTeam";
import TeamCard from "../components/TeamCard";
import MemberCard from "../components/MemberCard";
import InviteMembers from "../components/InviteMembers";
import UpdateMember from "../components/UpdateMember";
import TaskCard from "../components/TaskCard";
import { Avatar, AvatarGroup, Tooltip } from "@mui/material";
import AddTaskIcon from '@mui/icons-material/AddTask';
import {formatDate} from '../api/utils';

const Container = styled.div`
  padding: 14px 14px;
  @media screen and (max-width: 480px) {
    padding: 10px 10px;
  }
`;

const Header = styled.div``;

const Title = styled.div`
  font-size: 24px;
  @media screen and (max-width: 480px) {
    font-size: 20px;
  }
  font-weight: 600;
  color: ${({ theme }) => theme.text};
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
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.soft2};
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

const Team = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 8px 0px 0px 0px;
`;

const InviteButton = styled.button`
  padding: 6px 14px;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.primary};
  border-radius: 3px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  border-radius: 10px;
  transition: all 0.3s ease;
  margin: 0px 16px;
  &:hover {
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text};
  }
`;

const Hr = styled.hr`
  margin: 18px 0px;
  border: 0.5px solid ${({ theme }) => theme.soft + "99"};
`;

const Body = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  @media screen and (max-width: 1000px) {
    flex-direction: column;
  }
  gap: 20px;
`;

const Tasks = styled.div`
  flex: 1.5;
`;

const IcoBtn = styled(IconButton)`
  color: ${({ theme }) => theme.textSoft} !important;
`;

const HrHor = styled.div`
  border: 0.5px solid ${({ theme }) => theme.soft + "99"};
`;

const Extra = styled.div`
  flex: 0.8;
`;

const Null = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSoft + "99"};
`;

const SubCards = styled.div`
padding: 10px 12px 18px 12px;
text-align: left;
margin: 12px 0px;
border-radius: 10px;
background-color: ${({ theme }) => theme.card + "99"};
color: ${({ theme }) => theme.text};
cursor: pointer;
box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.09);
`;

const SubCardTop = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: center;
padding: 3px 4px;
color: ${({ theme }) => theme.text};
`;

const SubCardsTitle = styled.div`
font-size: 18px;
font-weight: 600;
color: ${({ theme }) => theme.text};
line-height: 1.5;
overflow: hidden;
text-overflow: ellipsis;
display: -webkit-box;
-webkit-line-clamp: 2; 
line-clamp: 2;
-webkit-box-orient: vertical;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 2px 0px 0px 0px;
`;


const ProjectDetails = ({setRefreshMenu}) => {
  const { project_id } = useParams();
  const [project, setProject] = useState({});
  const [projectOwner, setProjectOwner] = useState("");
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [created, setCreated] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openUpdateTeam, setOpenUpdateTeam] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [invitePopup, setInvitePopup] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [inviteMemberPopup, setInviteMemberPopup] = useState(false);
  const [updateMemberPopUp, setUpdateMemberPopUp] = useState(false);
  const [addNewTask, setAddNewTask] = useState(false);
  const [projectTeamMember, setProjectTeamMember] = useState([]);

  const token = localStorage.getItem("token");
  const dispatch = useDispatch();

  const fetchProject = async () => {
    try {
      const res = await getProject(project_id, token);
      const project = res.data.data;
      setProject(project);
      setTeams(project.assign_to);
      setProjectOwner(project.created_by);
    } catch (err) {
      dispatch(
        openSnackbar({
          message: err.response?.data?.message || "Failed to fetch project details.",
          severity: "error",
        })
      );
      setLoading(false);
    }
  };


  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [projectRes, taskRes, memberRes] = await Promise.all([
        getProject(project_id, token),
        getProjectTask(project_id, token),
        getProjectMember(project_id, token),
      ]);

      const project = projectRes.data.data;
      setProject(project);
      setTeams(project.assign_to);
      setProjectOwner(project.created_by);
      setTasks(taskRes.data.data);
      setProjectTeamMember(memberRes.data.data);
    } catch (err) {
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
  };

  useEffect(() => {
    console.log("useEffect project_id");
    window.scrollTo(0, 0);
    fetchAllData();
}, [project_id, openUpdate, openDelete, invitePopup, openUpdateTeam, inviteMemberPopup, updateMemberPopUp, addNewTask, created]);

  const handleTeamAdded = () => {
    setInvitePopup(false);
    fetchProject();
  };

  const handleDeleteClick = () => {
    setOpenDelete({
      state: true,
      name: project.project_name,
      type: "Project",
      project_id: project._id,
      token: token,
    });
  };

  const handleUpdateClick = () => {
    setOpenUpdate({
      state: true,
      type: "all",
      data: project,
    });
  };

  const handleAddTask = () => {
    setAddNewTask(true);
  }

  const handleTeamDeleteClick = (teamId, teamName) => {
    setOpenDelete({
      state: true,
      name: teamName,
      type: "Team",
      team_id: teamId,
      project_id: project._id,
      token: token,
    });
  };

  const handleTeamUpdateClick = (teamId) => {
    const selectedTeam = teams.find(team => team._id === teamId);
    setOpenUpdateTeam({
      state: true,
      type: "all",
      data: selectedTeam,
    });
  };

  const handleTeamCardClick = (teamId) => {
    setExpandedTeamId((prevTeamId) => (prevTeamId === teamId ? null : teamId));
  };
  

  return (
    <Container>
      {openUpdate.state && <UpdateProject openUpdate={openUpdate} setOpenUpdate={setOpenUpdate} setRefreshMenu={setRefreshMenu}/>}
      {openUpdateTeam.state && <UpdateTeam projectId={project_id} openUpdate={openUpdateTeam} setOpenUpdate={setOpenUpdateTeam} setRefreshMenu={setRefreshMenu}/>}
      {openDelete.state && <DeletePopup openDelete={openDelete} setOpenDelete={setOpenDelete} setRefreshMenu={setRefreshMenu} />}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '12px 0px', height: '300px' }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <Header>
            <Title>{project.project_name}</Title>
            <Desc>{project.project_description}</Desc>
            <Desc>Start Date: {formatDate(project.start_date)} - End Date: {formatDate(project.end_date)} </Desc>
            <Desc>Status: {project.project_status}</Desc>
            <Team>
              <AvatarGroup>
                <Tooltip title={`Owner: ${projectOwner.name}`} arrow>
                  <Avatar key={projectOwner._id} style={{ border: 'none' }}>
                    {projectOwner.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              </AvatarGroup>
            </Team>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <IcoBtn onClick={handleUpdateClick}>
                <Edit sx={{ fontSize: "20px" }} />
              </IcoBtn>
              <IcoBtn onClick={handleDeleteClick}>
                <Delete sx={{ fontSize: "20px" }} />
              </IcoBtn>
            </div>
            <Hr />
            {invitePopup && (
              <AddNewTeam
                setNewTeam={setInvitePopup}
                project_id={project_id}
                onTeamAdded={handleTeamAdded}
                setRefreshMenu={setRefreshMenu}
              />
            )}
          </Header>
          <Body>
            <Tasks>
              <SubCards>
                <SubCardTop>
                  <SubCardsTitle>Tasks</SubCardsTitle>
                  <InviteButton style={{ marginRight: '0px' }} onClick={handleAddTask}>
                    <AddTaskIcon sx={{ fontSize: "12px" }} /> Create New Task
                  </InviteButton>
                </SubCardTop>
                <TaskCard project_task={tasks}></TaskCard>
              </SubCards>
              {addNewTask && (
                <AddTask
                  project_member={projectTeamMember}
                  project_id={project._id}
                  setCreated={setCreated}
                  setAddNewTask={setAddNewTask}
                />
              )}
            </Tasks>
            <HrHor />
            <Extra>
              <SubCards>
                <SubCardTop>
                  <SubCardsTitle>Teams</SubCardsTitle>
                  <InviteButton onClick={() => setInvitePopup(true)}>
                    <GroupAddIcon sx={{ fontSize: "12px" }} />
                    Add Team
                  </InviteButton>
                </SubCardTop>
                
                  {teams.length > 0 ? (
                    teams.sort((a, b) => a.team_name.localeCompare(b.team_name)).map((team) => (
                      <div key={team._id}>
                        <TeamCard team={team} onClick={() => handleTeamCardClick(team._id)}>
                          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <IcoBtn onClick={(e) => { e.stopPropagation(); handleTeamUpdateClick(team._id); }}>
                              <Edit sx={{ fontSize: "20px" }} />
                            </IcoBtn>
                            <IcoBtn onClick={(e) => { e.stopPropagation(); handleTeamDeleteClick(team._id, team.team_name); }}>
                              <Delete sx={{ fontSize: "20px" }} />
                            </IcoBtn>
                          </div>
                        </TeamCard>
                        {expandedTeamId === team._id && (
                          <MemberCard team={team} >
                            <ButtonsContainer>
                              <InviteButton onClick={() => setInviteMemberPopup(true)}>
                                <PersonAdd sx={{ fontSize: "12px" }} /> Invite
                              </InviteButton>

                              {team.member.length > 0 &&
                                <InviteButton onClick={() => setUpdateMemberPopUp(true)}>
                                  <Edit sx={{ fontSize: "12px" }} /> Update
                                </InviteButton>}
                            </ButtonsContainer>
                            {inviteMemberPopup && (<InviteMembers setInvitePopup={setInviteMemberPopup} id={team._id} projectId={project_id} />)}
                            {updateMemberPopUp && (<UpdateMember project_id={project_id} setOpenUpdate={setUpdateMemberPopUp} members={team.member.sort((a, b) => a.user.name.localeCompare(b.user.name))} team_id={team._id} />)}
                          </MemberCard>
                        )}
                      </div>
                    ))
                  ) : (
                    <Null>No team found</Null>
                  )}
              </SubCards>
            </Extra>
          </Body>
        </>
      )}
    </Container>
  );
};

export default ProjectDetails;