<script lang="ts">
    import { auth, db } from "../lib/firebase";
    import { createUserWithEmailAndPassword } from "firebase/auth";
    import { doc, setDoc } from "firebase/firestore";

    let email = "",
        password = "",
        role = "Customer",
        error = "";

    async function register() {
        error = "";

        const res = await fetch("http://localhost:5000/api/check-role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, role }),
        });

        const result = await res.json();
        if (!res.ok) {
            error = result.error;
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "Users", email), { role });
            window.location.href = `/${role.toLowerCase()}`; // Redirect
        } catch (e) {
            error = (e as Error).message;
        }
    }
</script>

<h2>Register</h2>
<form on:submit|preventDefault={register}>
    <input type="email" bind:value={email} placeholder="Email" required />
    <input
        type="password"
        bind:value={password}
        placeholder="Password"
        required
    />
    <select bind:value={role}>
        <option>Customer</option>
        <option>Seller</option>
    </select>
    <button type="submit">Register</button>
    {#if error}<p class="error">{error}</p>{/if}
</form>
