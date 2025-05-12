<script lang="ts">
    import { Router, Route, Link } from "svelte-routing";
    import LoginPage from "./pages/login.svelte";
    import RegisterPage from "./pages/register.svelte";
</script>

<main>
    <Router>
        <Route path="/login">
            <LoginPage />
        </Route>
        <Route path="/login">
            <LoginPage />
        </Route>
        <Route path="/register">
            <RegisterPage />
        </Route>
    </Router>
</main>
