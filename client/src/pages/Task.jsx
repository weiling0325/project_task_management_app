import React, { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { getUserTask } from "../api/index";
import TaskCard from "../components/TaskCard";
import { openSnackbar } from "../redux/snackbarSlice";
import { CircularProgress } from "@mui/material";

const Container = styled.div`
  padding: 14px 14px;
  @media screen and (max-width: 480px) {
    padding: 10px 10px;
  }
`;

const Tasks = () => {
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);

    const token = localStorage.getItem("token");
    const dispatch = useDispatch();

    const getTasks = async () => {
      try {
        const response = await getUserTask(token); 
        setTasks(response.data.data);
        console.log("getTasks response.data.data: ", response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setLoading(false);
        dispatch(
          openSnackbar({
            message: error.response?.data?.message || "Failed to load tasks.",
            severity: "error",
          })
        );
      }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        getTasks();
    }, []);

    useEffect(() => {
      console.log("getTasks useEffect tasks: ", tasks);
      console.log("getTasks useEffect tasks length: ",tasks.length)
    },[tasks]);

    return (
      <Container>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '12px 0px', height: '300px' }}>
            <CircularProgress />
          </div>
        ) : (
          <TaskCard project_task={tasks} displayProjectColumn></TaskCard>
        )
      }
      </Container>
      
    );
  };

export default Tasks;
