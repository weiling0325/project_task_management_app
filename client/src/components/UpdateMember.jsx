import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { IconButton, Modal } from "@mui/material";
import { CloseRounded } from "@mui/icons-material";
import Checkbox from '@mui/material/Checkbox';
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import { updateMember, removeMember } from "../api/index";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";

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

const Card = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr; /* Match header */
  align-items: center;
  gap: 12px;
  padding: 10px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.soft + "66"};
`;

const Role = styled.div`
  font-size: 12px;
  padding: 4px 8px;
  text-align: center;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.bgDark + "20"};
  color: ${({ theme }) => theme.text};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0px;
  justify-content: center;
  align-items: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AllowToAccessText = styled.div`
  font-size: 12px;
  text-align: center;
  color: ${({ theme }) => theme.text};
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AvatarWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Details = styled.div`
  gap: 4px;
`;

const Name = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.textSoft};
`;

const EmailId = styled.div`
  font-size: 10px;
  font-weight: 400;
  color: ${({ theme }) => theme.textSoft + "99"};
`;

const Select = styled.select`
  border: none;
  font-size: 12px;
  background-color: transparent;
  outline: none;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.bgDark};
`;

const AddMember = styled.div`
  margin: 22px;
  padding: 12px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.bgDark + "98"};
`;

const InviteButton = styled.button`
  padding: 6px 14px;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.primary};
  border-radius: 1px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  border-radius: 10px;
  transition: all 0.3s ease;
  &:hover {
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text};
  }
`;


const UpdateMember = ({ project_id, team_id, setOpenUpdate, members }) => {
  const [Loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({members:members});
  
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  
  const updateTeamMember = async(member, member_id) => {
    try {
      setLoading(true);
      const input = {project_id: project_id, team_id: team_id, user_id: member_id, member_id: member_id, member_role: member.member_role, allow_to_modify: member.allow_to_modify };
      const res = await updateMember({member_id: member_id, member: input, token});
      if (res.status === 200) {
        dispatch(
          openSnackbar({
              message: "Team member updated successfully",
              type: "success",
          })
        );
      }
    } catch (err) {
       if (err.response?.status === 403) {
        dispatch(
          openSnackbar({
            message: "You are not authorized to update this member!",
            type: "error",
          })
        );
      } else {
        dispatch(
          openSnackbar({
            message: err.response?.data?.message || "Failed to update member",
            type: "error",
          })
        );
      }
    } finally {
      setLoading(false);
      setOpenUpdate(false);
    }
  }

  const removeTeamMember = async(member_id, user_id) => {
    try {
      const input = { project_id: project_id, team_id: team_id, user_id: user_id };
      const res = await removeMember({member_id: member_id, member: input, token});
        if (res.status === 200) {
          dispatch(
            openSnackbar({
                message: "Team member is removed successfully",
                type: "success",
            })
        );
      }
    } catch (err) {
      if (err.response?.status === 403) {
        dispatch(
          openSnackbar({
            message: "You are not authorized to remove this member!",
            type: "error",
          })
        );
      } else {
        dispatch(
          openSnackbar({
            message: err.response?.data?.message || "Failed to update member",
            type: "error",
          })
        );
      }

    } finally {
      setOpenUpdate(false);
      setLoading(false);
    }
  }
  
  
  return (
      <Modal open={true} onClose={() => setOpenUpdate(false)}>
          <Container>
            <Wrapper>
              <IconButton
                  style={{
                      position: "absolute",
                      top: "18px",
                      right: "20px",
                      cursor: "pointer",
                      color: "inherit",
                  }}
                  onClick={() => setOpenUpdate(false)}
              >
                <CloseRounded style={{ color: "inherit" }} />
              </IconButton>
              <Title>Update Members</Title>
                <AddMember>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '12px', marginTop: '6px' }}>Team Members</div>
                  <UsersList>
                  {inputs.members.map((user) => (
                    <Card key="user.user._id">
                      <AvatarWrapper>
                        <Avatar>
                          {user.user.account.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </AvatarWrapper>

                      <Details>
                        <Name>{user.user.account.name}</Name>
                        <EmailId>{user.user.account.email}</EmailId>
                      </Details>

                      <Role>
                        <Select
                          value={user.member_role}
                          onChange={(e) =>
                            setInputs({
                              ...inputs,
                              members: inputs.members.map((member) =>
                                member.user.account.email === user.user.account.email
                                  ? { ...member, member_role: e.target.value }
                                  : member
                              ),
                            })
                          }
                        >
                          <option value={user.member_role} disabled hidden>
                            {user.member_role}
                          </option>
                          <option value="Team Lead">Team Lead</option>
                          <option value="Member">Member</option>
                        </Select>
                      </Role>

                      <Row>
                        <Checkbox
                          checked={user.allow_to_modify}
                          onChange={(e) =>
                            setInputs({
                              ...inputs,
                              members: inputs.members.map((member) =>
                                member.user.account.email === user.user.account.email
                                  ? { ...member, allow_to_modify: e.target.checked }
                                  : member
                              ),
                            })
                          }
                        />
                        <AllowToAccessText>Allow Modify</AllowToAccessText>
                      </Row>

                      <ButtonGroup>
                        <InviteButton onClick={() => updateTeamMember(user, user._id)}>
                          {Loading ? <CircularProgress size={20} /> : "Update"}
                        </InviteButton>
                        <InviteButton onClick={() => removeTeamMember(user._id, user.user._id)}>
                          {Loading ? <CircularProgress size={20} /> : "Remove"}
                        </InviteButton>
                      </ButtonGroup>
                    </Card>
                  ))}
                    </UsersList>
                </AddMember>
              </Wrapper>
          </Container>
      </Modal>
  );
};

export default UpdateMember;
