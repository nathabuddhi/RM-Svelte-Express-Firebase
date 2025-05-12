<script lang="ts">
    import { auth, db } from "../lib/firebase";
    import { signInWithEmailAndPassword } from "firebase/auth";
    import { doc, getDoc } from "firebase/firestore";

    let email = "",
        password = "",
        error = "";

    async function login() {
        error = "";

        try {
            await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(db, "Users", email));
            if (!userDoc.exists()) {
                error = "User role not found.";
                return;
            }
            const role = userDoc.data().role;
            localStorage.setItem("userEmail", email);
            window.location.href = `/${role.toLowerCase()}`; // Redirect
        } catch (e) {
            error = (e as Error).message;
        }
    }
</script>

<h2>Login</h2>
<form on:submit|preventDefault={login}>
    <input type="email" bind:value={email} placeholder="Email" required />
    <input
        type="password"
        bind:value={password}
        placeholder="Password"
        required
    />
    <button type="submit">Login</button>
    {#if error}<p class="error">{error}</p>{/if}
</form>
