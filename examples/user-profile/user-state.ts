import React from "react";

import { Abon, AbonDeep, ReadonlyAbon } from "../../src";

export class UserState extends AbonDeep<User> {
    /** Whether the user is currently loading. */
    readonly loading: ReadonlyAbon<boolean>;
    /** Whether an error occured when fetching. */
    readonly error: ReadonlyAbon<Error | undefined>;
    /** The `name` or `username`, if the `username` is undefined. */
    readonly displayName: ReadonlyAbon<string | undefined>;

    constructor(readonly id: User["id"]) {
        super();

        this.displayName = Abon.from(
            () => this.get("name") || this.get("username"),
            (listener) => [this.subscribe("name", listener), this.subscribe("username", listener)],
        );
        this.loading = new Abon(true);
        this.error = new Abon();

        this.fetchUser()
            .then((user) => this.set(user))
            .catch((error) => (this.error as Abon<Error | undefined>).set(error))
            .finally(() => (this.loading as Abon<boolean>).set(false));
    }

    protected async fetchUser(): Promise<User> {
        return fetch("/user/" + this.id).then((response) => response.json());
    }

    static context = React.createContext<UserState>(undefined);

    static useContext() {
        return React.useContext(this.context);
    }
}

export interface User {
    id: number;
    name: string | undefined;
    username: string;
    email: string;
    avatar: string;
}
