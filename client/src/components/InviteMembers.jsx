import { CloseRounded, SearchOutlined, SendRounded } from "@mui/icons-material";
import { Modal } from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import React from "react";
import styled from "styled-components";
import { Avatar } from "@mui/material";
import { inviteMember, searchAccountByEmail } from "../api/index";
import { openSnackbar } from "../redux/snackbarSlice";
import { useDispatch } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
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
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  margin: 12px;
`;

const Search = styled.div`
  margin: 6px 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px;
  color: ${({ theme }) => theme.textSoft};
  background-color: ${({ theme }) => theme.bgDark};
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

const UsersList = styled.div`
  padding: 18px 8px;
  display: flex;
  margin-bottom: 12px;
  flex-direction: column;
  gap: 12px;
  border-radius: 12px;
  color: ${({ theme }) => theme.textSoft};
`;

const MemberCard = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: space-between;
  @media (max-width: 768px) {
    gap: 6px;
  }
`;
const UserData = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Details = styled.div`
  gap: 4px;
`;

const Name = styled.div`
  font-size: 13px;
  font-weight: 500;
  max-width: 100px;
  color: ${({ theme }) => theme.textSoft};
`;

const EmailId = styled.div`
  font-size: 10px;
  font-weight: 400;
  max-width: 100px;
  color: ${({ theme }) => theme.textSoft + "99"};
`;

const Flex = styled.div`
display: flex;
flex-direction: row;
gap: 2px;
@media (max-width: 768px) {
  display: flex;
  flex-direction: column;
  align-items: center;
}
`;

const Role = styled.div`
  padding: 6px 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bgDark};
`;

const AllowToAccessText = styled.div`
  width: 50px;
  border: none;
  font-size: 11px;
  background-color: transparent;
  outline: none;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.bgDark};
`;

const Select = styled.select`
  border: none;
  font-size: 12px;
  background-color: transparent;
  outline: none;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.bgDark};
`;

const InviteButton = styled.button`
  padding: 6px 8px;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.primary};
  border-radius: 1px;
  font-weight: 500;
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

const InviteMembers = ({ setInvitePopup, id, projectId }) => {
  const [users, setUsers] = React.useState([]);
  const [message, setMessage] = React.useState("");
  const [role, setRole] = React.useState("Member");
  const [loading, setLoading] = React.useState(false);
  const token = localStorage.getItem("token");
  const [search, setSearch] = React.useState("");
  const dispatch = useDispatch();

  const handleSearch = async (e) => {
    setSearch(e.target.value);
    searchAccountByEmail({ search: e.target.value, token: token })
      .then((res) => {
        if (res.status === 200) {
          const updatedUsers = res.data.map((user) => ({
            ...user,
            allowToAccess: false, 
          }));
          setUsers(updatedUsers);
          setMessage("");
        } else {
          setUsers([]);
          setMessage(res.status);
        }
      })
      .catch((err) => {
        setUsers([]);
        setMessage(err.message);
      });
  };

  const handleInvite = async (user) => {
    setLoading(true);
    try {
      const member = {
        project_id: projectId,
        user_id: user._id,
        email: user.email,
        token,
        member_role: role,
        allow_to_modify: user.allowToAccess,
      };
    
      const response = await inviteMember({ id: id, member: member, token });
      if (response.status === 200) {
        setInvitePopup(false);
        dispatch(
          openSnackbar({
            message: `Invitation sent to ${user.name}`,
            type: "success",
          })
        );
      } else if (response.status === 403) {
        setInvitePopup(false);
        dispatch(
          openSnackbar({
            message: `User is already a member of this project!`,
            type: "Error",
          })
        );
      }  else {
        throw new Error("Failed to send invitation.");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        dispatch(
          openSnackbar({
            message: "User is already a member of this project!",
            type: "error",
          })
        );
      } else  {
        dispatch(
          openSnackbar({
            message: err.response?.data?.message || "Failed to invite member",
            type: "error",
          })
        );
      }
      setInvitePopup(false);
    } finally {
      setInvitePopup(false);
      setLoading(false);
    }
  };

  const toggleAllowToAccess = (userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId
          ? { ...user, allowToAccess: !user.allowToAccess }
          : user
      )
    );
  };
  const handleChange = (e) => {
    setRole(e.target.value); 
  };
  
    
  return (
    <Modal open={true} onClose={() => setInvitePopup(false)}>
      <Container>
        <Wrapper>
          <CloseRounded
            sx={{ fontSize: "22px" }}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              cursor: "pointer",
            }}
            onClick={() => setInvitePopup(false)}
          />
          <Title>Invite Members</Title>
          <Search>
            <Input
              placeholder="Search by email..."
              onChange={(e) => handleSearch(e)}
            />
            <SearchOutlined
              sx={{ fontSize: "20px" }}
              style={{ marginRight: "12px", marginLeft: "12px" }}
            />
          </Search>
          {message && <div style={{ color: "red" }}>{message}</div>}
          <UsersList>
            {users?.map((user) => (
              <MemberCard key={user._id}>
                <UserData>
                  <Avatar sx={{ width: "34px", height: "34px" }} src={user.img}>
                    {user.email[0].toUpperCase()}
                  </Avatar>
                  <Details>
                    <Name>{user.name}</Name>
                    <EmailId>{user.email}</EmailId>
                  </Details>
                </UserData>
                <Flex>
                  <Role>
                    <Select
                      name="Member Role"
                      value={role}
                      onChange={handleChange}
                    >
                      <option value="Team Lead">Team Lead</option>
                      <option value="Member">Member</option>
                    </Select>
                  </Role>
                  <label style={{ display: "flex", alignItems: "center", gap: "0px" }}>
                    <Checkbox
                      checked={user.allowToAccess}
                      onChange={() => toggleAllowToAccess(user._id)}
                    />
                    <AllowToAccessText>Allow to Modify</AllowToAccessText>
                  </label>
                </Flex>
                <InviteButton onClick={() => handleInvite(user)}>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : (
                    <>
                      <SendRounded sx={{ fontSize: "13px" }} />
                      Invite
                    </>
                  )}
                </InviteButton>
              </MemberCard>
            ))}
          </UsersList>
        </Wrapper>
      </Container>
    </Modal>
  );
};

export default InviteMembers;

