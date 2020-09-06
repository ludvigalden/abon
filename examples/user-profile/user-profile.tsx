import React from "react";

import { UserState } from "./user-state";
import UserProfileAvatar from "./user-profile.avatar";
import UserProfileName from "./user-profile.name";

export default function UserProfile(props: UserProfileProps) {
    const state = React.useMemo(() => new UserState(props.id), [props.id]);

    const error = state.error.use().current;
    if (error) {
        return <p key="0">Error: {error.message || String(error)}</p>;
    }

    return (
        <UserState.context.Provider value={state} key="1">
            <UserProfileAvatar />
            <UserProfileName />
        </UserState.context.Provider>
    );
}

export interface UserProfileProps {
    id: number;
}
