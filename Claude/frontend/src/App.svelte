<!-- frontend/src/App.svelte -->
<script lang="ts">
    import { Router, Route } from "svelte-routing";
    import Register from "./pages/Register.svelte";
    import Login from "./pages/Login.svelte";

    export let url = "";
</script>

<Router {url}>
    <div>
        <Route path="/register"><Register /></Route>
        <Route path="/login"><Login /></Route>
        <!-- Add placeholder routes for now -->
        <Route path="/customer/dashboard"><h1>Customer</h1></Route>
        <Route path="/seller/dashboard"><h1>Seller</h1></Route>
    </div>
</Router>
