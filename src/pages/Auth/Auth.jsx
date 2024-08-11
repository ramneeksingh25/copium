import { useEffect, useState } from "react";
import InputField from "./components/InputField";
import { Button, Center, Divider, Flex } from "@chakra-ui/react";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { useUser } from "../../contexts/userContext";

const Auth = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [Rpassword, setRPassword] = useState("");
	const [Remail, setREmail] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const navigate = useNavigate();
	const { currentUser } = useAuth();
	const { setUser } = useUser();
	const login = async () => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch (error) {
			console.error("Error signing in with email and password:", error);
		}
	};
	const register = async () => {
		if (confirmPassword!=Rpassword) {
			alert("Passwords do not match");
		}
		else {
			await createUserWithEmailAndPassword(auth, Remail, Rpassword);
		}
	};
	useEffect(() => {
		if (currentUser) {
			(
				async()=>{
					await setDoc(doc(db, "Users", currentUser?.uid), {
						email: currentUser.email,
						displayName: name,
						id: currentUser.uid,
					});
				}
			)();
			setUser({
				email: currentUser.email,
				displayName: name,
				id: currentUser.uid,
			});

			navigate("/");
		}
	}, [currentUser]);
	return (
		<div className="flex items-center justify-center h-full w-full">
			<div className="bg-gradient-to-tl from-teal-900/20 to-teal-200/40 text-teal-700 border-teal-400  px-[5vw] py-10 text-center space-y-4 border rounded-xl relative">
				<Flex gap="5vw">
					<div className="flex flex-col space-y-4 items-center justify-center">
						<span className="font-bold text-3xl py-4 text-green-600">
							Log in to your account
						</span>
						<InputField
							type="Email"
							setter={setEmail}
						/>
						<InputField
							type="Password"
							setter={setPassword}
							errorBorderColor="red.300"
						/>
						<Button
							colorScheme="green"
							onClick={login}>
							Log In
						</Button>
					</div>
					<Center>
						<Divider
							orientation="vertical"
							borderColor={"lime.300"}
						/>
					</Center>
					<div className="flex flex-col space-y-4 items-center justify-center">
						<span className="font-bold text-3xl py-4 text-green-600">
							Create new account
						</span>
						<InputField
							type="Name"
							setter={setName}
						/>
						<InputField
							type="Email"
							setter={setREmail}
						/>
						<InputField
							type="Password"
							setter={setRPassword}
						/>
						<InputField
							type="Confirm Password"
							setter={setConfirmPassword}
							errorChecker={() => password == confirmPassword}
						/>
						<Button
							colorScheme="green"
							onClick={register}>
							Register
						</Button>
					</div>
				</Flex>
			</div>
		</div>
	);
};

export default Auth;
