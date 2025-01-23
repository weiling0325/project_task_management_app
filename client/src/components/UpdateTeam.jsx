import { IconButton, Modal } from "@mui/material";
import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import styled from "styled-components";
import { CloseRounded, CheckBox } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { updateTeam, inviteMember, updateMember, removeMember, searchAccountByEmail } from "../api/index";
import { openSnackbar } from "../redux/snackbarSlice";
import { useDispatch } from "react-redux";

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

const UpdateTeam = ({ id, projectId, openUpdate, setOpenUpdate }) => {
    const [Loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [backDisabled, setBackDisabled] = useState(false);

    const [showAddTeam, setShowAddTeam] = useState(true);
    const [inputs, setInputs] = useState({ id: openUpdate.data._id, team_name: openUpdate.data.team_name, team_role: openUpdate.data.team_role, members: openUpdate.data.members });
    
    const dispatch = useDispatch();
    const token = localStorage.getItem("token");

    console.log("inputs", inputs);

    const goToAddTeam = () => {
        setShowAddTeam(true);
    };

    useEffect(() => {
        if (openUpdate.type === "all") {
            goToAddTeam();
        } 
    }, [openUpdate]);

    const handleChange = (e) => {
        setInputs((prev) => {
            return { ...prev, [e.target.name]: e.target.value };
        });
    };

    const updateTeamData = async() => {
        setLoading(true);
        setDisabled(true);
        setBackDisabled(true);
        try {
            const team = {project_id: projectId, team_id: openUpdate.data._id, team_name: inputs.team_name, team_role: inputs.team_role};
            const res = await updateTeam({team_id: openUpdate.data._id, team: team, token:token});
            if (res.status === 200) {
                setLoading(false);
                setOpenUpdate({ ...openUpdate, state: false });
                dispatch(
                    openSnackbar({
                        message: "Team updated successfully",
                        type: "success",
                    })
                );
            }
        } catch (err) {
            if (err.response?.status === 403) {
                dispatch(
                  openSnackbar({
                    message: "You are not authorized to update this team!",
                    type: "error",
                  })
                );
              } else {
                dispatch(
                  openSnackbar({
                    message: err.response?.data?.message || "Failed to update team",
                    type: "error",
                  })
                );
              }
        } finally{
            setOpenUpdate({ ...openUpdate, state: false });
            setLoading(false);
            setDisabled(false);
            setBackDisabled(false);
        }
    }
  
    useEffect(() => {
        if (inputs.team_name === "" || inputs.team_role === "") {
            setDisabled(true)
        } else {
            setDisabled(false)
        }
    }, [inputs])

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
                    <Title>Update Team</Title>

                    {showAddTeam && (
                        <>
                            <Label>Team Details :</Label>
                            <OutlinedBox style={{ marginTop: "12px" }}>
                                <TextInput
                                    placeholder="Team Name (Required)*"
                                    type="text"
                                    name="team_name"
                                    value={inputs.team_name}
                                    onChange={handleChange}
                                />
                            </OutlinedBox>
                            <OutlinedBox style={{ marginTop: "6px" }}>
                                <TextInput
                                    placeholder="Team Role (Required)*"
                                    type="text"
                                    name="team_role"
                                    value={inputs.team_role}
                                    onChange={handleChange}
                                />
                            </OutlinedBox>
                            
                            <OutlinedBox
                                button={true}
                                activeButton={!disabled}
                                style={{ marginTop: "18px", width: "88%" }}
                                onClick={() => { !disabled && updateTeamData(); }
                                }>
                                {Loading ? (
                                    <CircularProgress color="inherit" size={20} />
                                ) : (
                                    "Update Team"
                                )}
                            </OutlinedBox>
                        </>
                    )}
                </Wrapper>
            </Container>
        </Modal>
    );
};

export default UpdateTeam;
