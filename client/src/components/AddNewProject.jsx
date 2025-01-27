import { IconButton, Modal } from "@mui/material";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { CloseRounded } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import { addProject } from "../api/index";
import { openSnackbar } from "../redux/snackbarSlice";
import { useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 0px;
  margin: 12px 0px;
  align-items: center;
  justify-content: space-between;
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
    color: ${({ theme }) => theme.textSoft};
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

const ErrorText = styled.div`
  color: red;
  font-size: 14px;
  font-weight: bold;
  text-align: left;
   margin: 5px 20px;
`;

const AddNewProject = ({ setNewProject, setRefreshMenu }) => {
  const [inputs, setInputs] = useState({
    project_name: "",
    project_description: "",
    start_date: "",
    end_date: "",
    project_status: "Working",
  });
  const [Loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [dateError, setDateError] = useState(false);
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const CreateProject = async () => {
    setLoading(true);
    setDisabled(true);
    setRefreshMenu(false);

    const project = { ...inputs };

    try {
      const res = await addProject({ project, token });
      if(res.status===200){
        setNewProject(false);
        dispatch(openSnackbar({ message: "Project created successfully", type: "success" }));
        setRefreshMenu(true);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      dispatch(openSnackbar({ message: "Failed to create project", type: "error" }));
    } finally {
      setLoading(false);
      setDisabled(false);
    }
  };

  useEffect(() => {
    const { project_name, start_date, end_date, project_status } = inputs;
    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      setDateError(true); 
      setDisabled(true); 
    } else {
      setDateError(false); 
      setDisabled(!project_name || !start_date || !end_date || !project_status);
    }
  }, [inputs]);

  return (
    <Modal open={true} onClose={() => setNewProject(false)}>
      <Container>
        <Wrapper>
          <IconButton
            style={{
              position: "absolute",
              top: "18px",
              right: "30px",
              cursor: "pointer",
              color: "inherit",
            }}
            onClick={() => setNewProject(false)}
          >
            <CloseRounded style={{ color: "inherit" }} />
          </IconButton>
          <Title>Create a New Project</Title>
          <Label>Title:</Label>
          <OutlinedBox style={{ marginTop: "12px" }}>
            <TextInput
              type="text"
              name="project_name"
              value={inputs.project_name}
              onChange={handleChange}
              placeholder="Project Title (Required)*"
            />
          </OutlinedBox>
          <Label>Description:</Label>
          <OutlinedBox style={{ marginTop: "12px" }}>
            <TextInput
              type="text"
              name="project_description"
              value={inputs.project_description}
              onChange={handleChange}
              placeholder="Project Description"
              rows={5}
            />
          </OutlinedBox>
          <Label>Start Date:</Label>
          <CustomDatePickerWrapper>
            <DatePicker
              selected={inputs.start_date}
              onChange={(date) => handleChange({ target: { name: "start_date", value: date } })}
              dateFormat="yyyy-MM-dd"
              placeholderText="Start Date (Required)*"
              className="custom-date-picker" 
            />
          </CustomDatePickerWrapper>
          <Label>End Date:</Label>
          <CustomDatePickerWrapper>
            <DatePicker
              selected={inputs.end_date}
              onChange={(date) => handleChange({ target: { name: "end_date", value: date } })}
              dateFormat="yyyy-MM-dd"
              placeholderText="End Date (Required)*"
              className="custom-date-picker" 
            />
          </CustomDatePickerWrapper>
          {dateError && (
            <ErrorText>
              Start date must be earlier than the end date.
            </ErrorText>
          )}
          <Label>Status:</Label>
            <Select 
            name="project_status"
            value={inputs.project_status}
            onChange={handleChange}
          >
            <option value="Working">Working</option>
            <option value="Completed">Completed</option>
            <option value="On-hold">On Hold</option>
          </Select>
          
          <ButtonContainer>
            <OutlinedBox button onClick={() => setNewProject(false)}>Cancel</OutlinedBox>
            <OutlinedBox
              button
              activeButton={!disabled}
              onClick={() => !disabled && CreateProject()}
            >
              {Loading ? <CircularProgress color="inherit" size={20} /> : "Create"}
            </OutlinedBox>
          </ButtonContainer>
        </Wrapper>
      </Container>
    </Modal>
  );
};

export default AddNewProject;
