import { IconButton, Modal } from "@mui/material";
import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import styled from "styled-components";
import { CloseRounded } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { updateProject } from "../api/index";
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

const Desc = styled.textarea`
  width: 100%;
  border: none;
  font-size: 14px;
  border-radius: 3px;
  background-color: transparent;
  outline: none;
  padding: 10px 0px;
  color: ${({ theme }) => theme.textSoft};
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

const Select = styled.select`
    border: none;
    font-size: 14px;
    outline: none;
    color: ${({ theme }) => theme.textSoft};
    background-color: transparent;
    min-height: 48px;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.soft2}; 
    margin: 9px 20px;
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
    margin: 5px 20px;
    min-height: 48px;
    background-color: transparent;
    border: 1px solid ${({ theme }) => theme.soft2};
    border-radius: 8px;
    padding: 0px 14px;
    font-size: 14px;
    color: ${({ theme }) => theme.textSoft};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.primary};
    }
  }
`;


const UpdateProject = ({ openUpdate, setOpenUpdate }) => {
    const [Loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [inputs, setInputs] = useState({
        id: openUpdate.data._id,
        project_name: openUpdate.data.project_name,
        project_description: openUpdate.data.project_description,
        start_date: openUpdate.data.start_date,
        end_date: openUpdate.data.end_date,
        project_status: openUpdate.data.project_status,
    });
    const [showAddProject, setShowAddProject] = useState(true);

    const dispatch = useDispatch();
    const token = localStorage.getItem("token");

    console.log("openUpdate", openUpdate);
    useEffect(() => {
        if (openUpdate.type === "all") {
          setShowAddProject(true);
        } else if (openUpdate.type === "member") {
          setShowAddProject(false);
        }
      }, []);

    const handleChange = (e) => {
        setInputs((prev) => ({
          ...prev,
          [e.target.name]: e.target.value,
        }));
      };
      
    const UpdateProject = async() => {
      try {
        setLoading(true);
        setDisabled(true);
        const project = { ...inputs };
        const res = await updateProject({ project_id: inputs.id, updateData: project, token })
        if(res.status === 200) {
          setLoading(false);
            setOpenUpdate({ ...openUpdate, state: false });
            dispatch(
              openSnackbar({
                message: "Project updated successfully",
                type: "success",
              })
            );
        } else if (res.status === 403){
          console.log("You are not authorized to update this project!");
            dispatch(
              openSnackbar({
                message: `You are not allowed to update this project!`,
                type: "Error",
              })
            );
        }
      } catch (err) {
        if (err.response?.status === 403) {
          dispatch(
            openSnackbar({
              message: "You are not authorized to update this project!",
              type: "error",
            })
          );
        } else {
          dispatch(
            openSnackbar({
              message: err.response?.data?.message || "Failed to update project",
              type: "error",
            })
          );
        }
        setDisabled(false);
      } finally {
        setLoading(false);
        setOpenUpdate({ ...openUpdate, state: false });
      }
    };

    useEffect(() => {
        const { project_name, project_description, start_date, end_date, project_status } = inputs;
        setDisabled(!project_name || !project_description || !start_date || !end_date || !project_status);
      }, [inputs]);

    return (
        <Modal open={true} onClose={() => setOpenUpdate({ ...openUpdate, state: false })}>
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
                        onClick={() => setOpenUpdate({ ...openUpdate, state: false })}
                    >
                        <CloseRounded style={{ color: "inherit" }} />
                    </IconButton>
                    <Title>Update Project</Title>

                    {showAddProject && (
                        <>
                            <Label>Project Details:</Label>
                            <OutlinedBox style={{ marginTop: "12px" }}>
                                <TextInput
                                    placeholder="Title (Required)*"
                                    type="text"
                                    name="project_name"
                                    value={inputs.project_name}
                                    onChange={handleChange}
                                />
                            </OutlinedBox>
                            <OutlinedBox style={{ marginTop: "6px" }}>
                                <Desc
                                    placeholder="Description (Required)* "
                                    name="project_description"
                                    rows={5}
                                    value={inputs.project_description}
                                    onChange={handleChange}
                                />
                            </OutlinedBox>
                            <CustomDatePickerWrapper>
                              <DatePicker
                                selected={inputs.start_date}
                                onChange={(date) => handleChange({ target: { name: "start_date", value: date } })}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="Start Date"
                                className="custom-date-picker" 
                              />
                            </CustomDatePickerWrapper>
                            <CustomDatePickerWrapper>
                              <DatePicker
                                selected={inputs.end_date}
                                onChange={(date) => handleChange({ target: { name: "start_date", value: date } })}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="Start Date"
                                className="custom-date-picker" 
                              />
                            </CustomDatePickerWrapper>
                            <Select
                                name="project_status"
                                value={inputs.project_status}
                                onChange={handleChange}
                            >
                                <option value="Working">Working</option>
                                <option value="Completed">Completed</option>
                                <option value="On-hold">On Hold</option>
                            </Select>
                            <OutlinedBox
                                button={true}
                                activeButton={!disabled}
                                style={{ marginTop: "18px", width: "89%" }}
                                onClick={() => { !disabled && UpdateProject(); }
                                }>
                                {Loading ? (
                                    <CircularProgress color="inherit" size={20} />
                                ) : (
                                    "Update Project"
                                )}
                            </OutlinedBox>
                        </>
                    )}
                </Wrapper>
            </Container>
        </Modal>
    );
}

export default UpdateProject;