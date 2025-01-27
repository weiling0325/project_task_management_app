import axios from 'axios';
const API = axios.create({ baseURL: `http://localhost:5000/api/` }); 

// auth
export const signUp = async ({ name, email, password }) =>
    await API.post('/auth/signup', { name, email, password });
export const signIn = async ({ email, password }) =>
    await API.post('/auth/signin', { email, password });
export const googleSignIn = async ({ name, email }) =>
    await API.post('/auth/google', { name, email }, { withCredentials: true });
export const findAccountByEmail = async (email) =>
    await API.get(`/auth/findbyemail?email=${email}`);
export const generateOTP = async (email, name, reason) =>
    await API.get(`/auth/generateotp?email=${email}&name=${name}&reason=${reason}`);
export const verifyOTP = async (otp) =>
    await API.get(`/auth/verifyotp?otp=${otp}`);
export const resetPassword = async ({ email, password }) =>
    await API.put('/auth/forgetpassword', { email, password });

// user
export const getUser = async (id, token) => 
    await API.get(`/user/get/${id}`, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const getUserByToken = async (token) => 
    await API.get(`/user/get`, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const updateUser = async ({ id, user_name, token }) => 
    await API.post(`/user/update/${id}`, { user_name }, { headers: { "Authorization": `Bearer ${token}` },  withCredentials: true });
export const deleteUser = async ({ id, token }) => 
    await API.post(`/user/delete/${id}`, {}, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const getUserProject = async (token) => 
    await API.get('/user/getProject', { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const getUserTeam = async (token) => 
    await API.get('/user/getTeam', { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const getUserTask = async (token) => 
    await API.get('/user/getTask', { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const getUserNotification = async (token) => 
    await API.get('/user/getNotification', { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const searchAccountByEmail = async ({search, token}) => 
    await API.get(`/user/searchAccountByEmail/${search}`, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const getSearchResult = async(search, token) => 
    await API.get(`/user/get/search/${search}`, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });

// project
export const addProject = async ({ project, token }) => 
    await API.post('/project/add', { project }, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const getProject = async (project_id, token) => 
    await API.get(`/project/get/${project_id}`, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const updateProject = async ({ project_id, updateData, token }) =>
    await API.post(`/project/update/${project_id}`, { ...updateData }, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const deleteProject = async ({ project_id, token }) => 
    await API.post(`/project/delete/${project_id}`, {}, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const getProjectMember = async (project_id, token) => 
    await API.get(`/project/getMember/${project_id}`, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });

// team
export const addTeam = async ({ project_id, team, token }) => 
    await API.post('/team/add', { project_id, team }, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const getTeam = async (team_id, token) => 
    await API.get(`/team/get/${team_id}`, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const updateTeam = async ({team_id, team, token}) => 
    await API.post(`/team/update/${team_id}`, team, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });
export const deleteTeam = async ({ project_id, team_id, token }) => 
    await API.post(`/team/delete/${team_id}`, { project_id }, { headers: { "Authorization": `Bearer ${token}` }, withCredentials: true });

// member
export const inviteMember = async ({ id, member, token }) =>
    await API.post(`/member/invite/${id}`, member, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
export const verifyInvitation = async ({ code, user_id, team_id, member_role, allow_to_modify}) =>
    await API.get(`/member/invite/${code}&user_id=${user_id}&team_id=${team_id}&member_role=${member_role}&allow_to_modify=${allow_to_modify}`, {withCredentials: true});
export const getMember = async ({ member_id, token }) =>
    await API.get(`/member/get/${member_id}`, {headers: { Authorization: `Bearer ${token}` }, withCredentials: true});
export const updateMember = async ({ member_id, member, token }) =>
    await API.post(`/member/update/${member_id}`, member, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
export const removeMember = async ({ member_id, member, token }) =>
    await API.post(`/member/remove/${member_id}`, member, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });

// task
export const assignTask = async ({formData, token}) =>
    await API.post('/task/assign', formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
export const getTask = async (task_id, token) =>
    await API.get(`/task/get/${task_id}`, { headers: { Authorization: `Bearer ${token}` } });
export const getProjectTask = async (project_id, token) =>
    await API.get(`/task/getProject/${project_id}`, { headers: { Authorization: `Bearer ${token}` } });
export const getTeamMemberTask = async (team_id, token) =>
    await API.get(`/task/getTeamMemberTask/${team_id}`, { headers: { Authorization: `Bearer ${token}` } });
export const updateTask = async ({ task_id, formData, token }) =>
    await API.post(`/task/update/${task_id}`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
export const deleteTask = async ({ task_id, token }) =>
    await API.post(`/task/delete/${task_id}`, { headers: { Authorization: `Bearer ${token}` } });
export const addTaskComment = async ({ task_id, comment, token }) =>
    await API.post(`/task/addComment/${task_id}`, comment, { headers: { Authorization: `Bearer ${token}` } });
export const getTaskComment = async (task_id, token) =>
    await API.get(`/task/getComment/${task_id}`, { headers: { Authorization: `Bearer ${token}` } });