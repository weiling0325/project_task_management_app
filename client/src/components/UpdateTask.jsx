import { IconButton, Modal } from "@mui/material";
import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import styled from "styled-components";
import { CloseRounded } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { updateTask, getProjectMember } from "../api/index";
import { openSnackbar } from "../redux/snackbarSlice";
import { useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
import { Avatar, Tooltip } from "@mui/material";
import AddMemberToTask from "./AddMemberToTask";
import "react-datepicker/dist/react-datepicker.css";

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #000000a7;
  display: flex;
  justify-content: center;
`;

const Wrapper = styled.div`
  width: 100%;
  height: min-content;
  margin: 2%;
  max-width: 600px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.bgLighter};
  color: ${({ theme }) => theme.text};
  padding: 10px;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Title = styled.div`
  font-size: 22px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  margin: 12px 20px;
`;

const Label = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft};
  margin: 12px 20px 0px 20px;
`;

const OutlinedBox = styled.div`
  min-height: 48px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.soft2};
  color: ${({ theme }) => theme.soft2};
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
    background: ${theme.soft};
    color:'${theme.soft2}';`}
    ${({ activeButton, theme }) =>
        activeButton &&
        `
    user-select: none; 
  border: none;
    background: ${theme.primary};
    color: white;`}
  margin: 3px 20px;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 14px;
`;

const TextInput = styled.input`
  width: 100%;
  border: none;
  font-size: 14px;
  border-radius: 3px;
  background-color: transparent;
  outline: none;
  color: ${({ theme }) => theme.textSoft};
`;

const Select = styled.select`
  border: none;
  font-size: 14px;
  outline: none;
  color: ${({ theme }) => theme.soft2};
  background-color: transparent;
  min-height: 48px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.soft2}; 
  margin: 12px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 14px;
`;

const CustomDatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    display: flex;
  }

  .react-datepicker__input-container {
    width: 100%;
  }

  .custom-date-picker {
    display: flex;
    justify-content: center;
    align-items: left;
    width: 89%;
    margin: 12px 20px;
    min-height: 48px;
    background-color: transparent;
    border: 1px solid ${({ theme }) => theme.soft2};
    border-radius: 8px;
    padding: 0px 14px;
    font-size: 14px;
    color: ${({ theme }) => theme.text};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.primary};
    }
  }
`;

const FileInput = styled.input`
  min-height: 34px;
  border: none
  color: ${({ theme }) => theme.textSoft};
  background-color: transparent;
  margin: 8px 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  margin: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft};
`;

const ErrorText = styled.div`
  color: red;
  font-size: 14px;
  text-align: left;
  margin: 0px 0px;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0px 20px;
`;

const Members = styled.div`
  display: flex;
  flex: 1;
  justify-content: start;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
`;

const MemberGroup = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.soft};
  padding: 4px 4px;
  gap: 1px;
  border-radius: 100px;
`;

const TextBtn = styled.div`
  margin: 8px 20px;
  font-size: 16px;
  font-weight: 500;
  color: #0094ea;
  &:hover {
    color: #0094ea99;
  }
`;

const Row = styled.div`
  margin: 0px 18px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.card + "99"};
  color: ${({ theme }) => theme.textSoft};
  cursor: pointer;
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.09);
`;

const Flex = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 0px 14px;
  flex-direction: column;
`;

const UpdateTask = ({ task_id, project_task, setOpenUpdateTask }) => {
    const project_id = project_task.project._id;
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [inputs, setInputs] = useState({
        task_title: project_task.task_title,
        priority: project_task.priority,
        duedate: project_task.duedate,
        task_description: project_task.task_description,
        task_status: project_task.task_status,
        task_attachment: project_task.task_attachment
    });
    const [fileList, setFileList] = useState([]);
    const [openSelectMemberPopUp, setOpenSelectMemberPopUp] = useState(false);
    const [selectMember, setSelectMember] = useState(project_task.assign_to);
    const [project_member, setProjectMember] = useState([]);
    const [noAssignedMemberError, setNoAssignedMemberError] = useState(false);
    const [removedAttachment, setRemovedAttachment] = useState([]);

    const dispatch = useDispatch();
    const token = localStorage.getItem("token");

    const fetchProjectMember = async () => {
        await getProjectMember(project_id, token).
            then((res) => {
                if (res.status === 200) {
                    setProjectMember(res.data.data);
                }
            })
            .catch((err) => {
                dispatch(
                    openSnackbar({
                        message: err.response?.data?.message || "Failed to fetch project members.",
                        severity: "error",
                    })
                );
            }).finally(() => setLoading(false));
    };

    const UpdateProjectTask = async () => {
        if (selectMember.length < 1) {
            setNoAssignedMemberError(true);
            setDisabled(true);
          } else {
            if(inputs.task_attachment.length > 0) {
                inputs.task_attachment.map(async (attachment) => {
              
                    if (attachment.url && attachment.filename && attachment.filetype) {
                      try {
                        const response = await fetch(attachment.url);
                        const blob = await response.blob();
                        const file = new File([blob], attachment.filename, {
                          type: attachment.filetype,
                        });
              
                        fileList.push(file); 
                      } catch (error) {
                        console.error("Error fetching or processing attachment: ", error);
                      }
                    } else {
                      console.error("Invalid attachment structure: ", attachment);
                    }
                  });
                }
            
            const formData = new FormData();
            fileList.forEach((file) => {
              formData.append("task_attachments", file);
            });
           
            const task = {
                user_id: selectMember.map((member) => member._id),
                task_title: inputs.task_title,
                priority: inputs.priority,
                duedate: inputs.duedate,
                task_description: inputs.task_description,
                task_status: inputs.task_status,
                project_id: project_id
            };
            formData.append("task", JSON.stringify(task));

            setLoading(true);
            setDisabled(true);
            try {
                const res = await updateTask({ task_id: task_id, formData: formData, token: token });
                if (res.status === 200) {
                    dispatch(
                        openSnackbar({
                            message: "Task updated successfully!",
                            severity: "success",
                        })
                    );
                    setOpenUpdateTask(false);
                }
            } catch (err) {
              if (err.response?.status === 403) {
                dispatch(
                  openSnackbar({
                      message: err.response?.data?.message || "You cannot assign the task to task creator!",
                      severity: "error",
                  })
              );
              } else {
                dispatch(
                    openSnackbar({
                        message: err.response?.data?.message || "Failed to update the task.",
                        severity: "error",
                    })
                );
              }
            } finally {
                setOpenUpdateTask(false);
                setLoading(false);
                setDisabled(false);
            } 
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.currentTarget.files);
        setFileList(files);
    };

    const removeAttachment = (attachmentId) => {
        setRemovedAttachment(attachmentId);
        setInputs((prev) => {
            const updatedAttachments = prev.task_attachment.filter((attachment) => {
                return attachment._id !== attachmentId;
            });
            return {
                ...prev,
                task_attachment: updatedAttachments,
            };
        });
    };

    const removeSelectedMember = (memberToRemove) => {
        setSelectMember((prev) => prev.filter((member) => member._id !== memberToRemove._id));
    };

    useEffect(() => {
      if (selectMember.length > 0) {
        setNoAssignedMemberError(false);
        setDisabled(false);
      }
        setDisabled(!inputs.task_title || !inputs.priority || !inputs.duedate || !inputs.task_status);
    }, [inputs, selectMember]);


    useEffect(()=> {
        fetchProjectMember();
    },[]);


    return (
        <Modal open={true} onClose={() => setOpenUpdateTask(false)}>
            <Container>
                {openSelectMemberPopUp && (<AddMemberToTask project_member={project_member} setOpenSelectMemberPopUp={setOpenSelectMemberPopUp} setSelectMember={setSelectMember} />)}
                <Wrapper>
                    <IconButton
                        style={{
                            position: "absolute",
                            top: "18px",
                            right: "30px",
                            cursor: "pointer",
                            color: "inherit",
                        }}
                        onClick={() => setOpenUpdateTask(false)}
                    >
                        <CloseRounded style={{ color: "inherit" }} />
                    </IconButton>
                    <Title>Update Task</Title>
                    <Label>Task Title:</Label>
                    <OutlinedBox style={{ marginTop: "12px" }}>
                        <TextInput
                            placeholder="Task Title (Required)*"
                            type="text"
                            name="task_title"
                            value={inputs.task_title}
                            onChange={handleChange}
                        />
                    </OutlinedBox>
                    <Label>Priority:</Label>
                    <Select
                        placeholder="Priority (Required)*"
                        value={inputs.priority}
                        name="priority"
                        onChange={handleChange}
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </Select>
                    <Label>Due Date:</Label>
                    <CustomDatePickerWrapper>
                        <DatePicker
                            selected={inputs.duedate}
                            onChange={(date) => handleChange({ target: { name: "duedate", value: date } })}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Due Date (Required)*"
                            className="custom-date-picker"
                        />
                    </CustomDatePickerWrapper>
                    <Label>Task Description:</Label>
                    <OutlinedBox>
                        <TextInput
                            placeholder="Task Description"
                            rows="4"
                            name="task_description"
                            value={inputs.task_description}
                            onChange={handleChange}
                        />
                    </OutlinedBox>
                    <Label>Task Status: </Label>
                    <Select
                        name="task_status"
                        value={inputs.task_status}
                        onChange={handleChange}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Working">Working</option>
                        <option value="Completed">Completed</option>
                        <option value="In review">In Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Cancelled">Cancelled</option>
                    </Select>
                    <Label>Attachments:</Label>
                    {inputs.task_attachment && inputs.task_attachment.length > 0 && (
                        inputs.task_attachment.map((attachment) => (
                          
                            <Row key={attachment._id} >
                                <a
                                    href={attachment.url}
                                    download={attachment.filename}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: "none", color: "#C1C7C9", fontSize: "14px", fontWeight: 500, fontFamily: "inherit" }}
                                >
                                    {attachment.filename}
                                </a>
                                <p style={{ fontSize: "10px", color: "gray", fontWeight: 300 }}>
                                    Uploaded on: {new Date(attachment.uploadedAt).toLocaleString()}
                                </p>
                                <CloseRounded
                                    onClick={() => removeAttachment(attachment._id)}
                                    style={{ fontSize: "18px", cursor: "pointer", marginLeft: "10px" }}
                                />
                            </Row>
                        ))
                    )}

                    <FileInput type="file" multiple onChange={handleFileChange} />
                    <TextBtn
                        style={{ padding: "6px", marginTop: "-10px", textAlign: "end" }}
                        onClick={() => setOpenSelectMemberPopUp(true)}
                    >
                        Assign To Member
                    </TextBtn>
                    <Bottom>
                        {noAssignedMemberError && (<ErrorText>Please assign member to the task</ErrorText>)}
                        <Members>
                            {selectMember.map((member) => (
                                <MemberGroup key={member._id}>
                                    <Tooltip title={`${member.name}`} arrow>
                                        <Avatar sx={{ width: "34px", height: "34px" }} src={member.img}>
                                            {member.name[0].toUpperCase()}
                                        </Avatar>
                                    </Tooltip>
                                    <CloseRounded
                                        onClick={() => removeSelectedMember(member)}
                                        style={{ fontSize: "18px" }}
                                    />
                                </MemberGroup>
                            ))}
                        </Members>
                    </Bottom>

                    <OutlinedBox
                        button={true}
                        activeButton={!disabled}
                        style={{ marginTop: "18px", width: "88%" }}
                        onClick={() => { !disabled && UpdateProjectTask(); }
                        }>
                        {loading ? (
                            <CircularProgress color="inherit" size={20} />
                        ) : (
                            "Update Task"
                        )}
                    </OutlinedBox>
                </Wrapper>
            </Container>
        </Modal>
    );
}

export default UpdateTask;