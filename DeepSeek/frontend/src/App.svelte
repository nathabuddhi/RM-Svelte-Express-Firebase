<script lang="ts">
    import svelteLogo from "./assets/svelte.svg";
    import viteLogo from "/vite.svg";
    import Counter from "./lib/Counter.svelte";
    import { Route, Router } from "svelte-routing";
    import Login from "./routes/Login.svelte";
    import Register from "./routes/Register.svelte";
</script>

<Router>
    <Route path="/">
        <Counter />
    </Route>
    <Route path="/login">
        <Login />
    </Route>
    <Route path="/register">
        <Register />
    </Route>
</Router>

