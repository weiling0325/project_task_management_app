import { IconButton, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";
import { assignTask } from "../api/index";
import styled from "styled-components";
import CircularProgress from "@mui/material/CircularProgress";
import { CloseRounded } from "@mui/icons-material";
import DatePicker from "react-datepicker";
import { Avatar, Tooltip } from "@mui/material";
import "react-datepicker/dist/react-datepicker.css";
import AddMemberToTask from "./AddMemberToTask";
import { tagColors } from "../data/data";

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

const TextInput = styled.input`
  width: 100%;
  border: none;
  font-size: 14px;
  border-radius: 3px;
  background-color: transparent;
  outline: none;
  color: ${({ theme }) => theme.textSoft};
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 0px;
  margin: 12px 0px;
  align-items: center;
  justify-content: space-between;
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

const ErrorText = styled.div`
  color: red;
  font-size: 14px;
  text-align: left;
  margin: 0px 0px;
`;

const AddTask = ({ project_member, project_id, setCreated, setAddNewTask }) => {
  const randomTagColor = tagColors[Math.floor(Math.random() * tagColors.length)];
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [selectMember, setSelectMember] = useState([]);
  const [openSelectMemberPopUp, setOpenSelectMemberPopUp] = useState(false);
  const [inputs, setInputs] = useState({ assign_to: "", task_title: "", priority: "Low", duedate: "", task_description: "", task_status: "Pending", task_attachment: "" });
  const [noAssignedMemberError, setNoAssignedMemberError] = useState(false);

  const token = localStorage.getItem("token");
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const files = Array.from(e.currentTarget.files);
    setFileList(files);
  };

  const handleCreateTask = async () => {
    if (selectMember.length < 1) {
      setNoAssignedMemberError(true);
      setDisabled(true);
    } else {
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
        project_id
      };

      formData.append("task", JSON.stringify(task));

      setLoading(true);
      setDisabled(true);
      try {
        const res = await assignTask({ formData: formData, token: token });
        if (res.status === 200) {
          dispatch(
            openSnackbar({
              message: "Task assigned successfully!",
              severity: "success",
            })
          );
          setCreated(true);
          setAddNewTask(false);
        }
      } catch (err) {
        if(err.response?.status === 403){
          dispatch(
            openSnackbar({
              message: "You cannot assign a task to yourself!",
              severity: "error",
            })
          );
        } else {
          console.error("Error assigning task:", err);
          dispatch(
            openSnackbar({
              message: err.message || "An error occurred.",
              severity: "error",
            })
          );
        }
      } finally {
        setLoading(false);
        setDisabled(false);
        setAddNewTask(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
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


  return (
    <Modal open={true} onClose={() => setAddNewTask(false)}>
      <Container>
        {openSelectMemberPopUp && (<AddMemberToTask project_member={project_member} setOpenSelectMemberPopUp={setOpenSelectMemberPopUp} setSelectMember={setSelectMember} />)}
        <Wrapper>
          <IconButton
            style={{ position: "absolute", top: "18px", right: "0px", cursor: "pointer", color: "inherit" }}
            onClick={() => setAddNewTask(false)}
          >
            <CloseRounded />
          </IconButton>

          <Title>Create a New Task</Title>
          <Label>Task Title:</Label>
          <OutlinedBox>
            <TextInput
              placeholder="Task Title (Required)*"
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
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2px' }}>
            <FileInput type="file" multiple onChange={handleFileChange} />
            <TextBtn
              style={{ padding: "6px", textAlign: "end" }}
              onClick={() => setOpenSelectMemberPopUp(true)}
            >
              Assign To Member
            </TextBtn>
          </div>
          <Bottom>
            {noAssignedMemberError && (<ErrorText>Please assign member to the task</ErrorText>)}
            <Members>
              {selectMember.map((member) => (
                <MemberGroup key={member._id}>
                  <Tooltip title={`${member.account.name}`} arrow>
                    <Avatar sx={{ width: "34px", height: "34px" }} src={member.img}>
                      {member.account.email[0].toUpperCase()}
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
          <ButtonContainer>
            <OutlinedBox button onClick={() => setAddNewTask(false)}>Cancel</OutlinedBox>
            <OutlinedBox
              button
              activeButton={!disabled}
              onClick={() => handleCreateTask()}
            >
              {loading ? <CircularProgress color="inherit" size={20} /> : "Create"}
            </OutlinedBox>
          </ButtonContainer>
        </Wrapper>
      </Container>
    </Modal>

  );
};

export default AddTask;


