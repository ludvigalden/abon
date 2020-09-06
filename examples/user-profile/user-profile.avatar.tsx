import React from "react";

import { UserState } from "./user-state";

export default function UserProfileAvatar() {
    const state = UserState.useContext();
    const avatar = state.use("avatar");
    return <img src={avatar} />;
}
