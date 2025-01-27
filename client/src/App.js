import { ThemeProvider } from "styled-components";
import { useState } from "react";
import { darkTheme, lightTheme } from "./utils/Theme";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"
import Menu from './components/Menu';
import Navbar from './components/Navbar';
import styled from 'styled-components';
import Dashboard from './pages/Dashboard';
import Task from './pages/Task';
import Projects from './pages/Projects';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ProjectDetails from './pages/ProjectDetails';
import Teams from './pages/Teams';
import TeamDetails from './pages/TeamDetails';
import ToastMessage from './components/ToastMessage';
import { useSelector } from "react-redux";
import AddNewTeam from './components/AddNewTeam';
import { useEffect } from 'react';
import Home from './pages/Home/Home';
import TeamInvite from './components/TeamInvite';
import InviteMembers from "./components/InviteMembers";
import AddNewProject from './components/AddNewProject';
import TaskDetails from "./components/TaskDetails";

const Container = styled.div`
height: 100vh;
  display: flex; 
  background-color: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  overflow-x: hidden;
`;

const Main = styled.div`
  flex: 7;
`;
const Wrapper = styled.div`
  padding: 0% 1%;
  overflow-y: scroll !important;
`;

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(true);
  const [newTeam, setNewTeam] = useState(false);
  const [newProject, setNewProject] = useState(false);
  const {open, message, severity} = useSelector((state) => state.snackbar);
  const [refreshMenu, setRefreshMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const { currentUser } = useSelector(state => state.user);
  
  useEffect(() => {
    const resize = () => {
      if (window.innerWidth < 1110) {
        setMenuOpen(false);
      } else {
        setMenuOpen(true);
      }
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>

        <BrowserRouter>
          {currentUser ?
            <Container >
              {loading ? <div>Loading...</div> : <>
                {menuOpen && <Menu setMenuOpen={setMenuOpen} setDarkMode={setDarkMode} darkMode={darkMode} setNewTeam={setNewTeam} refreshMenu={refreshMenu} />}
                <Main>
                  <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
                  <Wrapper>
                    {newTeam && <AddNewTeam setNewTeam={setNewTeam} setRefreshMenu={setRefreshMenu}/>}
                    {newProject && <AddNewProject setNewProject={setNewProject} setRefreshMenu={setRefreshMenu}/>}
                    <Routes>
                      <Route >
                        <Route exact path="/" element={<Dashboard newProject={newProject} setNewProject={setNewProject} setRefreshMenu={setRefreshMenu}/>} />
                        <Route path="project" element={<Projects newProject={newProject} setNewProject={setNewProject} setRefreshMenu={setRefreshMenu}/>} />
                        <Route path="project">
                          <Route path=":project_id" element={<ProjectDetails setRefreshMenu={setRefreshMenu}/>} />
                        </Route>
                        <Route path="team" element={<Teams />} />
                        <Route path="team">
                          <Route path=":team_id" element={<TeamDetails setRefreshMenu={setRefreshMenu}/>} />
                        </Route>
                        <Route path="team/invite">
                          <Route path=":code" element={<TeamInvite />} />
                        </Route>
                        <Route path="task" element={<Task />} />
                        <Route path="task">
                          <Route path=":task_id" element={<TaskDetails />} />
                        </Route>
                        <Route path="*" element={<div>Not Found</div>} />
                      </Route>
                    </Routes>
                  </Wrapper>
                </Main>
              </>}
            </Container>
            : <ThemeProvider theme={darkTheme}
            >

              <Routes>
                <Route exact path="/">
                  <Route index element={
                    <Home />} />
                  <Route path="team/invite">
                    <Route path=":code" element={<TeamInvite />} />
                  </Route>
                  <Route path="member/invite">
                    <Route path=":code" element={<InviteMembers />} />
                  </Route>
                </Route>
              </Routes>
            </ThemeProvider>}
          {open && <ToastMessage open={open} message={message} severity={severity} />}

        </BrowserRouter>
      </ThemeProvider>
    </DndProvider>
  );
}

export default App;
