import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import {
    useLocation
} from "react-router-dom";
import { useNavigate } from 'react-router-dom'
import { useSelector } from "react-redux";
import { verifyInvitation } from '../api/index';
import { openSnackbar } from "../redux/snackbarSlice";
import styled from 'styled-components';
import { CircularProgress } from '@mui/material';
import { useParams } from "react-router-dom";

const Joining = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 2rem;
`;

const TeamInvite = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    function useQuery() {
        const { search } = useLocation();

        return React.useMemo(() => new URLSearchParams(search), [search]);
    }

    let query = useQuery();

    const { code } = useParams();
    const team_id = query.get("team_id");
    const user_id = query.get("user_id");
    const allow_to_modify = query.get("allow_to_modify") === "true";
    const member_role = query.get("member_role");

    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        verifyInvitation(code, user_id, team_id, member_role, allow_to_modify,).then((res) => {
            if (res.status === 200) {
                dispatch(openSnackbar({ message: res.data.Message, type: "success" }));
                if (currentUser)
                    navigate(`/team/${team_id}`);
                else
                    navigate(`/`);
            }
            else {
                navigate(`/`);
            }
        }
        ).catch((err) => {
            console.log(err);
            navigate(`/`);
        }
        )
    }, [code, team_id, user_id, allow_to_modify, member_role]);

    return (
        <Joining>
            <CircularProgress />
        </Joining>
    )
}

export default TeamInvite