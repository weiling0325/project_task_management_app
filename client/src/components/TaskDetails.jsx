import SendIcon from '@mui/icons-material/Send';
import { Avatar, Tooltip } from "@mui/material";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { openSnackbar } from "../redux/snackbarSlice";
import { useParams } from "react-router-dom";
import {formatDate, formatDateTime} from '../api/utils';
import { useDispatch } from "react-redux";
import CircularProgress from '@mui/material/CircularProgress';
import { IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useSelector } from "react-redux";
import UpdateTask from './UpdateTask';
import { getTask, addTaskComment, getTaskComment } from "../api/index";

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
  -webkit-line-clamp: 2; 
  line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const SubCards = styled.div`
padding: 10px 12px 18px 12px;
text-align: left;
margin: 20px 0px;
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
font-size: 16px;
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

const Row = styled.div`
  padding: 5px 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  border-radius: 12px;
  color: ${({ theme }) => theme.textSoft};
  cursor: pointer;
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.09);
`;

const Card = styled.div`
  padding: 5px 8px;
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-top: 10px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.card + "99"};
  color: ${({ theme }) => theme.textSoft};
  cursor: pointer;
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.09);
`;

const Body = styled.div`
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  margin-bottom: 0px;
  gap: 12px;
  border-radius: 12px;
  color: ${({ theme }) => theme.textSoft};
  cursor: pointer;
`;

const Label = styled.div`
  display: flex;
  font-size: 14px;
  align-items: center;
  font-weight: 800;
  min-width: 80px;
  text-align: right;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.textSoft};
  cursor: pointer; 
  text-decoration: none;
`;

const Text = styled.div`
  display: flex;
  font-size: 14px;
  align-items: center;
  font-weight: 500;
  min-width: 80px;
  text-align: right;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.textSoft};
  cursor: pointer; 
  text-decoration: none;
`;


const Priority = styled.div`
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

const Status = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  padding: 4px 8px;
  border-radius: 8px;
  text-align: center;

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

const DueDate = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.yellow };
  padding: 4px 8px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.yellow + "100"};
`;

const CommentBox = styled.div`
  width: 100%; 
  display: flex;
  flex-direction: column; 
  gap: 12px;
  border-radius: 10px;
  color: ${({ theme }) => theme.textSoft};
`;

const Input = styled.input`
  flex: 1;
  border: none;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.bgDark};
  outline: none;
  color: ${({ theme }) => theme.textSoft};
`;

const CommentInputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 5px; 
`;

const Members = styled.div`
  margin: -10px 5px;
  justify-content: center; 
  align-items: center; 
  gap: 2px;
  flex-wrap: wrap;
`;

const MemberGroup = styled.div`
  display: flex;
  justify-content: center; 
  align-items: center; 
  gap: 4px;
  border-radius: 100px;
`;

const Team = styled.div`
  margin: 0px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: ${({ theme }) => theme.text};
  padding: 4px 8px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.soft2 + "22"};
`;

const Value = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const IcoBtn = styled(IconButton)`
  color: ${({ theme }) => theme.textSoft} !important;
`;

const Null = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSoft + "99"};
`;

const CommentName = styled.div`
  display: flex;
  font-size: 14px;
  align-items: center;
  font-weight: 400;
  text-align: left;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.text};
  cursor: pointer; 
  text-decoration: none;
  background-color:transparent;
  margin: 0px 0px 5px;
`;

const CommentTxt = styled.div`
  display: flex;
  font-size: 14px;
  align-items: center;
  font-weight: 300;
  text-align: left;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.text};
  cursor: pointer; 
  text-decoration: none;
  background-color:transparent;
  margin: 0px 0px 5px;
`;

const CommentRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 3px;
  width: 100%; 
  flex-direction: column;
`;

const CommentData = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px;
  border-radius: 8px;
`;

const CommentTime = styled.div`
  font-size: 10px;
  font-weight: 400;
  margin: -2px 0px 5px;
  color: ${({ theme }) => theme.textSoft + "99"};
`;

const FileRow = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  color: ${({ theme }) => theme.textSoft};
  cursor: pointer;
`;

const TaskDetails = () => {
  const { task_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState({
    task_title: "",
    project: { project_name: "" },
    task_description: "",
    priority: "",
    duedate: null,
    task_status: "",
    task_attachment: [],
    assign_by: { name: "" },
    assign_to: [],
    team: []
  });
  const [comment, setComment] = useState("");
  const [displayComment, setDisplayComment] = useState([]);
  const [enableSubmitButton, setEnableSubmitButton] = useState(false);
  const [openUpdateTask, setOpenUpdateTask] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setComment(e.target.value);
  };

  const addComment = async() => {
    setLoading(true);
    try {
      const comment_txt = {comment};
      const res = await addTaskComment({task_id: task_id, comment: comment_txt, token});
      if(res.status === 200) {
        setComment("");
        await fetchTaskComment();
      }
    } catch (err) {
        dispatch(
          openSnackbar({
            message: err.response?.data?.message || "Failed to add the comment.",
            severity: "error",
          })
        );
    } finally {
      setLoading(false);
    }
  }

  const fetchTaskComment = async() => {
    try {
      const res = await getTaskComment(task_id, token);
      if (res.status ===200 ){
        setDisplayComment(res.data.data);
      }
    } catch (err) {
      dispatch(
        openSnackbar({
          message: err.response?.data?.message || "Failed to fetch the task comment.",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  }

  const fetchAllData = async() => {
    try {
      setLoading(true);
      const [taskRes, taskCommentRes] = await Promise.all([
        getTask(task_id, token),
        getTaskComment(task_id, token)
      ]);
      setTask(taskRes.data.data);
      setDisplayComment(taskCommentRes.data.data);
    } catch (err) {
      dispatch(
        openSnackbar({
          message: err.response?.data?.message || "Failed to fetch the data.",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=> {
    fetchAllData();
  },[]);

  useEffect(() => {
    fetchAllData();
  }, [openUpdateTask]);
  
  useEffect(()=> {
    if(comment && comment !== "" && comment !== " "){
      setEnableSubmitButton(true);
    } else {
      setEnableSubmitButton(false);
    }
  },[comment]);

  return (
      <Container>
        {openUpdateTask && <UpdateTask task_id={task_id} project_task={task} setOpenUpdateTask={setOpenUpdateTask}/>}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '12px 0px', height: '300px' }}>
            <CircularProgress />
          </div>
          ) :( task && 
            <>
              <Header>
              <Title>{task.task_title}</Title>
              <Card>
              <Body>
                <Row>
                  <Label>Project: </Label>
                  <Value>
                    <Text>{task.project.project_name}</Text>
                  </Value>
                </Row>
                <Row>
                  <Label>Description: </Label>
                  <Value>
                    <Text>{task.task_description? task.task_description: "-" }</Text>
                  </Value>
                </Row>
                <Row>
                  <Label>Priority: </Label>
                  <Value>
                    <Priority priority={task.priority}>{task.priority}</Priority>
                  </Value>
                </Row>
                <Row>
                  <Label>Due Date:</Label>
                  <Value>
                    <DueDate>
                      {formatDate(task.duedate)}
                    </DueDate>
                  </Value>
                </Row>
                <Row>
                  <Label>Status:</Label>
                  <Value>
                    <Status status={task.task_status}>{task.task_status}</Status>
                  </Value>
                </Row>
                <Row>
                  <Label>Attachments:</Label>
                  <Value>
                  <FileRow>
                  {task.task_attachment && task.task_attachment.length > 0 ? (
                  
                    task.task_attachment.map((attachment) => (
                      <Row key={attachment._id} >
                        <a
                          href={attachment.url}
                          download={attachment.filename}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none", color: "white", fontSize: "14px", fontWeight:500, fontFamily:"inherit" }}
                        >
                          {attachment.filename}
                        </a>
                        <p style={{ fontSize: "10px", color: "gray",  fontWeight:300 }}>
                          Uploaded on: {new Date(attachment.uploadedAt).toLocaleString()}
                        </p>
                      </Row>
                    ))
                  ) : (
                    <Null>No attachments available.</Null>
                  )}
                  </FileRow>
                  </Value>
                </Row>
              </Body>
              </Card>
              <Card>
                <Body>
                  <Row>
                    <Label>Members:</Label>
                  </Row>
                  <Row>
                  <Members>
                  <MemberGroup key = {task._id}>
                  {!task.assign_to.some(
                    (task_member) => task_member._id === task.assign_by._id
                  ) && (
                    <Tooltip title={`Assigned by: ${task.assign_by.name}`} arrow>
                      <Avatar
                        sx={{ width: "30px", height: "30px" }}
                        style={{ border: "none" }}
                      >
                        {task.assign_by.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </Tooltip>
                  )}

                  {task.assign_to.map((task_member) => (
                    <Tooltip title={`Assigned To: ${task_member.name}`} arrow key={task_member._id}>
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
                  </Row>
                </Body>
              </Card>

              <Card>
                <Body>
                  <Row>
                    <Label>Teams:</Label>
                  </Row>
                  <Row>
                  <Team style={{marginTop: "-10px"}}>
                  {task.team.length > 0 ? task.team.map((team) => team.team_name).join(", ") : '-'}
                </Team>
                </Row>
                </Body>
              </Card>
            </Header>

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <IcoBtn onClick={() => setOpenUpdateTask(true)}>
                <Edit sx={{ fontSize: "20px" }} />
              </IcoBtn>
            </div>

            <SubCards>
              <SubCardTop>
                <SubCardsTitle>Comments</SubCardsTitle>
              </SubCardTop>
              <CommentBox>
                <CommentData>
                  <Avatar
                    sx={{ width: "34px", height: "34px" }}
                    style={{ border: "none" }}
                  >
                    {currentUser.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <CommentRow>
                    <CommentName>{currentUser.name}</CommentName>
                    <CommentInputContainer>
                      <Input
                        name="comment"
                        value={comment}
                        onChange={(e) => handleChange(e)}
                        placeholder="Add comment"
                      />
                      {enableSubmitButton && (
                        <SendIcon
                          onClick={addComment}
                          sx={{ fontSize: "18px" }} 
                        />
                      )}
                    </CommentInputContainer>
                  </CommentRow>
                </CommentData>

                {displayComment.length > 0 && (
                  displayComment.map((comment) => (
                    <CommentData key={comment.comment_by._id}>
                      <Avatar
                        sx={{ width: "34px", height: "34px" }}
                        style={{ border: "none" }}
                      >
                        {comment.comment_by.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <CommentRow>
                        <CommentName>{comment.comment_by.name}</CommentName>
                        <CommentTxt>{comment.comment_text}</CommentTxt>
                        <CommentTime>{formatDateTime(comment.comment_time)}</CommentTime>
                      </CommentRow>

                    </CommentData>
                  ))
                )}
              </CommentBox>
            </SubCards>
          </>
        )}
      </Container>
  );
};

export default TaskDetails;
