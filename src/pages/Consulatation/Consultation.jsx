import { useEffect, useState } from "react";
import InputField from "./components/InputField";
import { Select } from "@chakra-ui/react";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useUser } from "../../contexts/userContext";
import RazorpayCheckout from "./Checkout/RazorpayCheckOut";
import { useNavigate } from "react-router-dom";

const Consultation = () => {
	const { user } = useUser();
	const [name, setName] = useState();
	const [age, setAge] = useState();
	const [speciality, setSpeciality] = useState("");
	const [gender, setGender] = useState("");
	const [image, setImage] = useState(null);
	const [filled, setFilled] = useState(false);
	const [paid, setPaid] = useState(false);
	const [paymentData, setPaymentData] = useState(null);
	const [NavToChat, setNavToChat] = useState(false);
	const nav = useNavigate();
	const saveDataToDB = async () => {
		const patientData = { name, age, speciality, gender, image, user };
		await addDoc(collection(db, "PHI"), patientData);

	};
	const submitPatientForm = (e) => {
		e.preventDefault();
		if (filled) {
			paid && saveDataToDB();
		} else {
			alert("Please fill all fields");
		}
	};

	const getPaymentDetails = async () => {
		const docRef = doc(db, "Users", user.id);
		const docSnap = await getDoc(docRef);
		setPaymentData(docSnap.data());
	};
	useEffect(() => {
		if (name && age && gender && speciality) {
			setFilled(true);
		}
	}, [name, age, gender, speciality])
	
	useEffect(() => {
		if (user) {
			getPaymentDetails();
		}
	}, [user]);
	useEffect(() => {
		if (paymentData?.paymentTimestamp) {
			console.log(paymentData.paymentTimestamp.seconds);
			const date = new Date(paymentData.paymentTimestamp)
			const now = new Date();
			console.log(date);

			if (
				date.getDate() === now.getDate() &&
				date.getMonth() === now.getMonth() &&
				date.getFullYear() === now.getFullYear()
			) {
				const condition = (now.getTime()-date.getTime())/60000;
				if(condition<=30){
					setNavToChat(true);
				}
			}
		}
	}, [paymentData]);
	useEffect(() => {
		if (NavToChat) {
			nav("/chat");
		}
	}, [NavToChat]);
	return (
		<div className="bg-teal-500/20 text-teal-900 rounded-xl space-y-4 p-2 shadow-md">
			<form
				onSubmit={submitPatientForm}
				className="space-y-4 p-3">
				<span className="font-bold font-poppins">Fill this form to begin</span>
				<InputField
					type={"Name"}
					setter={setName}
				/>
				<div className="flex items-center gap-3">
					<div className="w-1/2">
						<Select
							onChange={(e) => setGender(e.target.value)}
							placeholder="Gender"
							variant={"filled"}
							borderColor="green.500">
							<option value="Male">Male</option>
							<option value="Female">Female</option>
						</Select>
					</div>
					<div className="">
						<InputField
							type={"Age"}
							setter={setAge}
						/>
					</div>
					<Select
						onChange={(e) => setSpeciality(e.target.value)}
						placeholder="Consultation Speciality"
						variant={"filled"}
						borderColor="green.500">
						{["Heart", "Kidney", "General", "ENT", "Child"].map((spec) => {
							return (
								<option
									key={spec}
									value={spec}>
									{spec}
								</option>
							);
						})}
					</Select>
				</div>
				<div className="flex gap-3 items-center">
					<span className="font-semibold">Add Attachment (if any) :</span>
					<input
						type="file"
						id="photo"
						onChange={(e) => {
							setImage(e.target.value);
						}}></input>
				</div>
				<RazorpayCheckout
					filled={filled}
					paymentFunction={setPaid}
				/>
			</form>
		</div>
	);
};

export default Consultation;
