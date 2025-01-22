import { IconButton, Modal, Snackbar } from "@mui/material";
import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import styled from "styled-components";
import {CloseRounded } from "@mui/icons-material";
import { useSelector } from "react-redux";
import {
  addTeam, 
  searchAccountByEmail, 
  inviteMember
} from "../api/index";
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

const AddNewTeam = ({ setNewTeam, project_id  }) => {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [inputs, setInputs] = useState({ team_name: "", team_role: "" });
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const createTeam = async () => {
    setLoading(true);
    setDisabled(true);
    try {
      const teamData = {
        team_name: inputs.team_name,
        team_role: inputs.team_role,
      };
      const res = await addTeam({ project_id, team: teamData, token });
      if (res.status === 200) {
        dispatch(
          openSnackbar({
            message: "Team created successfully",
            type: "success",
          })
        );
        setNewTeam(false); 
      }
    } catch (err) {
      console.error("Error creating team:", err);
      dispatch(openSnackbar({ message: "Something went wrong", type: "error" }));
    } finally {
      setLoading(false);
      setDisabled(false);
    }
  };

  useEffect(() => {
    setDisabled(inputs.team_name.trim() === "" || inputs.team_role.trim() === "");
  }, [inputs]);

  return (
    <Modal open={true} onClose={() => setNewTeam(false)}>
      <Container>
        <Wrapper>
          <IconButton
            style={{ position: "absolute", top: "18px", right: "20px", color: "inherit" }}
            onClick={() => setNewTeam(false)}
          >
            <CloseRounded />
          </IconButton>
          <Title>Create a New Team</Title>
          <Label>Team Name:</Label>
          <OutlinedBox>
            <TextInput
              placeholder="Team Name (Required)*"
              name="team_name"
              value={inputs.team_name}
              onChange={handleChange}
            />
          </OutlinedBox>
          <Label>Team Role:</Label>
          <OutlinedBox>
            <TextInput
              placeholder="Team Role (Required)*"
              name="team_role"
              value={inputs.team_role}
              onChange={handleChange}
            />
          </OutlinedBox>
          <ButtonContainer>
            <OutlinedBox button onClick={() => setNewTeam(false)}>Cancel</OutlinedBox>
            <OutlinedBox
              button
              activeButton={!disabled}
              onClick={createTeam}
              disabled={disabled}
            >
              {loading ? <CircularProgress size={20} /> : "Create"}
            </OutlinedBox>
          </ButtonContainer>
        </Wrapper>
      </Container>
    </Modal>
  );
};

// const AddNewTeam = ({ setNewTeam, project_id }) => {

//   const [Loading, setLoading] = useState(false);
//   const [disabled, setDisabled] = useState(true);
//   const [showAddTeam, setShowAddTeam] = useState(true);
//   const [inputs, setInputs] = useState({ team_name: "", team_role: ""});
//   const [search, setSearch] = useState("");
//   const [users, setUsers] = useState([]);
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [role, setRole] = useState("");
//   const [access, setAccess] = useState("");
//   const token = localStorage.getItem("token");
//   const dispatch = useDispatch();

//   const { currentUser } = useSelector((state) => state.user);

//   const handleSearch = async (e) => {
//     const email = e.target.value;
//     setSearch(email);
//     setUsers([]);

//     try {
//       const res = await searchAccountByEmail({ email, token });
//       if (res.status === 200 && res.data) {
//         setUsers([res.data]);
//       } else {
//         setUsers([]);
//       }
//     } catch (err) {
//       console.error("Error fetching users:", err);
//       setUsers([]);
//     }
//   };

//   const handleSelect = (user) => {
//     if (!selectedUsers.find((u) => u.id === user._id)) {
//       setSelectedUsers([...selectedUsers, { id: user._id, name: user.name, email: user.email, role, access }]);
//       setSearch("");
//       setUsers([]);
//     }
//   };

//   const handleRemove = (user) => {
//     setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
//   };


//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setInputs((prev) => ({ ...prev, [name]: value }));
//   };
  
//   const CreateTeam = () => {
//     setLoading(true);
//     setDisabled(true);
    
//     try {
//       const teamData = {
//         team_name: inputs.team_name,
//         team_role: inputs.team_role,
//       };
//       console.log("project_id", project_id);
//       console.log("teamData", teamData);
//       const res = addTeam({ project_id, team: teamData, token });
//       if (res.status === 200) {
//         dispatch(
//           openSnackbar({
//             message: "Team created successfully",
//             type: "success",
//           })
//         );
//         setNewTeam(false);
//         }
        
//     } catch (err) {
//       console.error("Error creating team:", err);
//       dispatch(openSnackbar({ message: "Something went wrong", type: "error" }));
//     } finally {
//       setLoading(false);
//       setDisabled(false);
//     }
//   };

//   useEffect(() => {
//     if (inputs.team_name.trim() === "" || inputs.team_role.trim() === "") {
//       setDisabled(true);
//     } else {
//       setDisabled(false);
//     }
//   }, [inputs]);

//   return (
//     <Modal open={true} onClose={() => setNewTeam(false)}>
//       <Container>
//         <Wrapper>
//           <IconButton
//             style={{
//               position: "absolute",
//               top: "18px",
//               right: "30px",
//               cursor: "pointer",
//               color: "inherit",
//             }}
//             onClick={() => setNewTeam(false)}
//           >
//             <CloseRounded style={{ color: "inherit" }} />
//           </IconButton>
//           <Title>Create a new Team</Title>

//           {showAddTeam && (
//             <>
//               <Label>Team Name :</Label>
//               <OutlinedBox style={{ marginTop: "12px" }}>
//                 <TextInput
//                   placeholder="Team Name (Required)*"
//                   type="text"
//                   name="team_name"
//                   value={inputs.team_name}
//                   onChange={handleChange}
//                 />
//               </OutlinedBox>
//               <Label>Team Role :</Label>
//               <OutlinedBox style={{ marginTop: "12px" }}>
//                 <TextInput
//                   placeholder="Team Role (Required)*"
//                   type="text"
//                   name="team_role"
//                   value={inputs.team_role}
//                   onChange={handleChange}
//                 />
//               </OutlinedBox>
//             <ButtonContainer>
//             <OutlinedBox button onClick={() => setNewTeam(false)}>Cancel</OutlinedBox>
//             <OutlinedBox
//               button
//               activeButton={!disabled}
//               onClick={() => CreateTeam()} disabled={disabled}
//             >
//               {Loading ? <CircularProgress color="inherit" size={20} /> : "Create"}
//             </OutlinedBox>
//           </ButtonContainer>
//             </>
//           )}
//         </Wrapper>
//       </Container>
//     </Modal>
//   );
// };

export default AddNewTeam;
