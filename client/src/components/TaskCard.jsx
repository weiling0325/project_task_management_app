import React, { useEffect, useMemo } from "react";
import styled from "styled-components";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from '@mui/material/CircularProgress';
import { Avatar, Tooltip } from "@mui/material";
import {formatDate} from '../api/utils';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Table = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 6px 10px;
`;

const Search = styled.div`
  margin: 10px 0px;
  width: 100%;
  @media screen and (max-width: 480px) {
    width: 50%;
  }
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  color: ${({ theme }) => theme.textSoft};
  background-color: ${({ theme }) => theme.card + "99"};
`;

const Input = styled.input`
  width: 100%;
  border: none;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 100px;
  background-color: transparent;
  outline: none;
  color: ${({ theme }) => theme.textSoft};
`;

const Select = styled.select`
    border: none;
    font-size: 14px;
    outline: none;
    color: ${({ theme }) => theme.text};
    background-color: ${({ theme }) => theme.bgDark};
    border-radius: 8px;
    border: 1.8px solid ${({ theme }) => theme.soft + "99"};
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px 10px;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 12px 10px;
  gap: 8px;
  border-radius: 8px 8px 0px 0px;
  border: 1.8px solid ${({ theme }) => theme.soft + "99"};
  background-color: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  background-color: ${({ theme }) => theme.bgDark};
`;

const TableHeaderContent = styled.div`
  font-size: 14px;
  font-weight: 800;
  text-align: center;
  text-overflow: ellipsis;
  flex: ${({ width }) => width || "1"};
  color: ${({ theme }) => theme.soft2};
  cursor: pointer; 
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  ${({ enddate, theme }) =>
    enddate &&
    `
    color: ${theme.pink};
    `}
  display: -webkit-box;
  -webkit-line-clamp: 5; 
  line-clamp: 5;
  -webkit-box-orient: vertical;

  ${({ completed, theme }) =>
    completed === "Completed" &&
    `
  text-decoration: line-through;
  `}
`;

const No = styled.div`
  flex: ${({ width }) => width || "1"};
  text-align: center;
  width: 4%;
  font-size: 12px;
  text-overflow: ellipsis;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  display: -webkit-box;
  -webkit-line-clamp: 5; 
  line-clamp: 5;
  -webkit-box-orient: vertical;

  ${({ completed, theme }) =>
    completed === "Completed" &&
    `
    text-decoration: line-through;
    `}
`;

const Card = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  gap: 8px;
  border-left: 1.8px solid ${({ theme }) => theme.soft + "99"};
  border-right: 1.8px solid ${({ theme }) => theme.soft + "99"};
  border-bottom: 1.8px solid ${({ theme }) => theme.soft + "99"};
  background-color: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  &:hover {
    transition: all 0.2s ease-in-out;
    background-color: ${({ theme }) => theme.bgDark + "40"};
  }

  ${({ completed, theme }) =>
    completed === "Completed" &&
    `
    background-color: ${theme.soft + "30"};
    `}
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
`;

const Project = styled.div`
  flex: ${({ width }) => width || "1"};
  width: 40%;
  font-size: 12px;
  font-weight: 500;
  text-align: justify;
  color: ${({ theme }) => theme.text};
  display: -webkit-box;
  -webkit-line-clamp: 5; 
  line-clamp: 5;
  -webkit-box-orient: vertical;
  padding: 6px;

  ${({ completed, theme }) =>
    completed === "Completed" &&
    `
    text-decoration: line-through;
    `}
`;

const Task = styled.div`
  flex: ${({ width }) => width || "1"};
  width: 50%;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: ${({ theme }) => theme.text};
  display: -webkit-box;
  -webkit-line-clamp: 5; 
  line-clamp: 5;
  -webkit-box-orient: vertical;
  padding: 6px;

  ${({ completed, theme }) =>
    completed === "Completed" &&
    `
    text-decoration: line-through;
    `}
`;

const Date = styled.div`
  flex: ${({ width }) => width || "1"};
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  text-overflow: ellipsis;
  width: 14%;
  color: ${({ theme }) => theme.text};
  ${({ enddate, theme }) =>
    enddate &&
    `
    color: ${theme.pink};
    `}
  display: -webkit-box;
  -webkit-line-clamp: 5; /* number of lines to show */
  line-clamp: 5;
  -webkit-box-orient: vertical;

  ${({ completed, theme }) =>
    completed === "Completed" &&
    `
  text-decoration: line-through;
  `}
`;

const Priority = styled.div`
  flex: ${({ width }) => width || "1"};
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  width: 10%;
  padding: 4px 8px;
  border-radius: 8px;

  color: ${({ priority, theme }) =>
    priority === "Low"
      ? theme.green
      : priority === "Medium"
      ? theme.yellow
      : theme.red};
  background: ${({ priority, theme }) =>
    priority === "Low"
      ? theme.green + "10"
      : priority === "Medium"
      ? theme.yellow + "10"
      : theme.red + "10"};
`;

const DueDate = styled.div`
  flex: ${({ width }) => width || "1"};
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  width: 10%;
  color: ${({ theme }) => theme.text};
  padding: 4px 8px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.soft2 + "22"};
`;


const Status = styled.div`
  flex: ${({ width }) => width || "1"};
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  width: 10%;
  padding: 4px 8px;
  border-radius: 8px;

  color: ${({ status, theme }) =>
    status === "Completed"
      ? theme.green
      : status === "Pending"
      ? theme.grey
      : theme.yellow};
  background: ${({ status, theme }) =>
    status === "Completed"
      ? theme.green + "10"
      : status === "Pending"
      ? theme.grey + "10"
      : theme.yellow + "10"};
`;

const Team = styled.div`
  flex: ${({ width }) => width || "1"};
  font-size: 12px;
  text-overflow: ellipsis;
  font-weight: 500;
  text-align: center;
  color: ${({ theme }) => theme.text};
  display: -webkit-box;
  -webkit-line-clamp: 5; 
  line-clamp: 5;
  -webkit-box-orient: vertical;

  ${({ completed, theme }) =>
    completed === "Completed" &&
    `
    text-decoration: line-through;
    `}
`;

const TableCell = styled.div`
  display: flex; 
  justify-content: center;
  align-items: center; 
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.soft2};
  flex: ${({ width }) => width || "1"};

  ${({ completed, theme }) =>
    completed === "Completed" &&
    `text-decoration: line-through;`}
`;

const Null = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSoft};
  margin: 5px 20px 0px 0px;
`;

const Members = styled.div`
  justify-content: center; 
  align-items: center; 
  gap: 2px;
  flex-wrap: wrap;
`;

const MemberGroup = styled.div`
  display: flex;
  justify-content: center; 
  align-items: center; 
  padding: 4px;
  gap: 4px;
  border-radius: 100px;
`;

const TaskCard =({project_task, displayProjectColumn=false}) => {
  const [tasks, setTasks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filter, setFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedMember, setSelectedMember] = useState("");

  const navigate = useNavigate();

  const sortTasks = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  
    const sortedTasks = [...tasks].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];
  
      if (typeof valueA === "string" && typeof valueB === "string") {
        return direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
  
      if (key === "duedate") {
        return direction === "asc"
          ? new Date(valueA) - new Date(valueB)
          : new Date(valueB) - new Date(valueA);
      }
  
      if (valueA < valueB) return direction === "asc" ? -1 : 1;
      if (valueA > valueB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  
    setTasks(sortedTasks);
  };
  
  const uniqueTeams = Array.from(
    new Set(tasks.flatMap((task) => task.team.map((team) => team.team_name)))
  );
  
  const uniqueMembers = Array.from(
    new Set(
      tasks.flatMap((task) =>
        [
          task.assign_by.name,
          ...task.assign_to.map((member) => member.name),
        ].filter(Boolean)
      )
    )
  );

  const handleTeamFilter = (e) => {
    const team = e.target.value;
    setSelectedTeam(team);
  
    const filteredTasks = project_task.filter((task) =>
      task.team.some((t) => t.team_name === team)
    );
    setTasks(team ? filteredTasks : project_task);
  };
  
  const handleMemberFilter = (e) => {
    const member = e.target.value;
    setSelectedMember(member);
  
    const filteredTasks = project_task.filter(
      (task) =>
        task.assign_by.name === member ||
        task.assign_to.some((m) => m.name === member)
    );
    setTasks(member ? filteredTasks : project_task);
  };
  
  const handleFilter = (e) => {
    const value = e.target.value.toLowerCase();
    setFilter(value);

    const filteredTasks = project_task
    .map((task, i) => ({ ...task, no: i + 1 })) 
    .filter((task) => task.task_title.toLowerCase().includes(value));

    setTasks(filteredTasks);
  };

  const handleProjectFilter = (e) => {
    const value = e.target.value.toLowerCase();
    setProjectFilter(value);

    const filteredTasks = project_task.filter((task) =>
      task.project.project_name.toLowerCase().includes(value)
    );
    setTasks(filteredTasks);
  };

  const getTaskDetail= (task) =>{
    navigate(`/task/${task._id}`);
  }

  const getProjectDetail= (project) =>{
    navigate(`/project/${project._id}`);
  }

  const getTeamDetail= (team) =>{
    navigate(`/team/${team._id}`);
  }

  useEffect(() => {
    const tasksWithIndex = project_task.map((task, i) => ({ ...task, no: i + 1 }));
    setTasks(tasksWithIndex);
  }, [project_task]);
  
  useEffect(() => {
    console.log("TaskCard useEffect tasks: ", tasks);
  },[tasks]);

return (
  <>
    {displayProjectColumn && (
      <Search>
        <Input placeholder="Filter tasks by project" onChange={handleProjectFilter} value={projectFilter}/>
        <SearchIcon style={{ marginRight: "20px", marginLeft: "20px", color: "${({ theme }) => theme.textSoft}" }} />
      </Search>
    )}
    <Search>
      <Input placeholder="Filter tasks by title" onChange={handleFilter} value={filter}/>
      <SearchIcon style={{ marginRight: "20px", marginLeft: "20px", color: "${({ theme }) => theme.textSoft}" }} />
    </Search>


    <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
      <Select value={selectedTeam} onChange={handleTeamFilter}>
        <option value="">Filter by Team</option>
          {uniqueTeams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
      </Select>
      <Select value={selectedMember} onChange={handleMemberFilter}>
        <option value="">Filter by Member</option>
          {uniqueMembers.map((member) => (
            <option key={member} value={member}>
              {member}
            </option>
          ))}
      </Select>
    </div>

    <Table>
      <TableHeader>
      <TableHeaderContent
            width="0.5"
            onClick={() => sortTasks("no")}
            style={{ cursor: "pointer" }}
          >
            No {sortConfig.key === "no" && (sortConfig.direction === "asc" ? "↑" : "↓")}
          </TableHeaderContent>
          {displayProjectColumn && (
            <TableHeaderContent
            width="2"
            onClick={() => sortTasks("task_title")}
            style={{ cursor: "pointer" }}
          >
            Projects {sortConfig.key === "project_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
          </TableHeaderContent>
          )}
          <TableHeaderContent
            width="2"
            onClick={() => sortTasks("task_title")}
            style={{ cursor: "pointer" }}
          >
            Tasks {sortConfig.key === "task_title" && (sortConfig.direction === "asc" ? "↑" : "↓")}
          </TableHeaderContent>
          <TableHeaderContent
            width="1"
            onClick={() => sortTasks("priority")}
            style={{ cursor: "pointer" }}
          >
            Priority {sortConfig.key === "priority" && (sortConfig.direction === "asc" ? "↑" : "↓")}
          </TableHeaderContent>
          <TableHeaderContent
            width="1"
            onClick={() => sortTasks("duedate")}
            style={{ cursor: "pointer" }}
          >
            Due Date {sortConfig.key === "duedate" && (sortConfig.direction === "asc" ? "↑" : "↓")}
          </TableHeaderContent>
          <TableHeaderContent
            width="1"
            onClick={() => sortTasks("task_status")}
            style={{ cursor: "pointer" }}
          >
            Task Status {sortConfig.key === "task_status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
          </TableHeaderContent>
      <TableHeaderContent width="2" style={{ fontSize: "14px", fontWeight: "800" }}>Members</TableHeaderContent>
      <TableHeaderContent width="1" style={{ fontSize: "14px", fontWeight: "800" }}>Teams</TableHeaderContent>
      </TableHeader>

      <TaskList>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <Card key={`${task._id}-${task.no}`}>
              <No width="0.5">{task.no}</No>
              {displayProjectColumn && (
                <Project width="2" onClick={() => {getProjectDetail(task.project)}}>{task.project.project_name}</Project>
              )}
              <Task width="2" onClick={() => {getTaskDetail(task)}}>{task.task_title}</Task>
              <Priority width="1"  priority={task.priority}>{task.priority}</Priority>
              <DueDate width="1">{formatDate(task.duedate)}</DueDate>
              <Status width="1" status={task.task_status}>{task.task_status}</Status>
              <TableCell width="2" key = {task._id}>
                <Members>
                  <MemberGroup key = {task._id}>
                  {!task.assign_to.some(
                    (task_member) => task_member._id === task.assign_by._id
                  ) && (
                    <Tooltip title={`${task.assign_by.name}`} arrow>
                      <Avatar
                        sx={{ width: "30px", height: "30px" }}
                        key={task.assign_by._id}
                        style={{ border: "none" }}
                      >
                        {task.assign_by.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </Tooltip>
                  )}

                  {task.assign_to.map((task_member) => (
                    <Tooltip title={`${task_member.name}`} arrow key={task_member._id}>
                      <Avatar
                        sx={{ width: "30px", height: "30px" }}
                        style={{ border: "none" }}
                      >
                        {task_member.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </Tooltip>
                    ))}
                  </MemberGroup>
              </Members>
            </TableCell>
              <Team width="1">
              {task.team.length > 0
                ? task.team.map((team, index) => (
                    <span
                      key={team._id} 
                      onClick={() => { getTeamDetail(team); }}>
                      {team.team_name}
                    </span>
                  )).reduce((prev, curr) => [prev, ", ", curr]) 
                : '-'}
              {/* {task.team.length > 0 ? task.team.map((team) => team.team_name).join(", ") : '-'} */}
              </Team>
            </Card>
          ))
        ) : (
          <Null>No task found</Null>
        )}
      </TaskList>
    </Table>
  </>
  
);

};

export default TaskCard;
