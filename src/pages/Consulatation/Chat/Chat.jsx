import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaMicrophone } from "react-icons/fa";
import { Button, Input } from "@chakra-ui/react";
import "regenerator-runtime/runtime";
import SpeechRecognition, {
	useSpeechRecognition,
} from "react-speech-recognition";
import CountdownTimer from "./CountDownTimer";
import { useNavigate } from "react-router-dom";
import { db } from "../../../config/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useUser } from "../../../contexts/userContext";

const Chat = () => {
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [listening, setListening] = useState(false);
	const chatEndRef = useRef(null);
	const { transcript } = useSpeechRecognition();
	const navigate = useNavigate();
	const { currentUser } = useAuth();
	const [paymentData, setPaymentData] = useState(null);
	const [navToConsult, setnavToConsult] = useState(false);
	const [timer, setTimer] = useState(0);
	const { user } = useUser();
	const nav = useNavigate();
	const [showTimer, setShowTimer] = useState(false);
	const getPaymentDetails = async () => {
		const docRef = doc(db, "Users", user.id);
		const docSnap = await getDoc(docRef);
		setPaymentData(docSnap.data());
	};
	useEffect(() => {
		if (user) {
			getPaymentDetails();
		}
	}, [user]);
	useEffect(() => {
		if (paymentData?.paymentTimestamp) {
			const date = new Date(paymentData.paymentTimestamp);
			const now = new Date();
			if (
				date.getDate() === now.getDate() &&
				date.getMonth() === now.getMonth() &&
				date.getFullYear() === now.getFullYear()
			) {
				const condition = (now.getTime() - date.getTime()) / 60000;
				setTimer(condition * 60);
				if (condition ==0) {
					setnavToConsult(true)					
				}
			}
		} 

	}, [paymentData]);
	useEffect(() => {
		if (navToConsult) {
			nav("/consultation");
		}
	}, [navToConsult]);
	useEffect(() => {
		setShowTimer(true);
	}, [timer]);
	const getTranscript = () => {
		if (listening) {
			SpeechRecognition.stopListening();
			setListening(false);
			handleSubmit();
		} else {
			SpeechRecognition.startListening();
			setListening(true);
		}
	};

	const formatResponse = (text) => {
		return text
			.replace(/\*\*\*/g, "")
			.replace(/\*\*/g, "")
			.replace(/\n/g, "<br/>");
	};

	const handleSubmit = async (e) => {
		e?.preventDefault();
		if (!input.trim()) return;

		const updatedMessages = [...messages, { text: input, type: "user" }];
		const conversationContext = updatedMessages
			.map(
				(msg) => `${msg.type === "user" ? "Patient" : "Doctor"}: ${msg.text}`
			)
			.join("\n");

		const prompt = `You are a doctor. Continue this conversation as a doctor and respond to the patient's query appropriately.\n\n${conversationContext}\nDoctor:`;

		setMessages([...messages, { text: input, type: "user" }]);
		setInput("");
		setLoading(true);

		try {
			const response = await axios.post(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API}`,
				{
					contents: [
						{
							parts: [
								{
									text: prompt,
								},
							],
						},
					],
				}
			);

			if (response.data.candidates && response.data.candidates.length > 0) {
				const botMessage = response.data.candidates[0].content.parts[0].text;

				setMessages([
					...messages,
					{ text: input, type: "user" },
					{ text: formatResponse(botMessage), type: "bot" },
				]);
			} else {
				setMessages([
					...messages,
					{ text: input, type: "user" },
					{ text: "No response from bot", type: "bot" },
				]);
			}
		} catch (error) {
			console.error("Error fetching response:", error);
			setMessages([
				...messages,
				{ text: "Error fetching response", type: "bot" },
			]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		(async () => {
			if (messages.length > 0 && !messages[0].timestamp) {
				const timestamp = new Date();
				setMessages([
					...messages.map((message, index) =>
						index === 0 ? { ...message, timestamp } : message
					),
				]);

				await updateDoc(db, "Users", currentUser?.id, {
					firstMessageTimestamp: timestamp,
				})
					.then(() => {
						console.log("Timestamp sent to the database");
					})
					.catch((error) => {
						console.error("Error sending timestamp to the database:", error);
					});
			}
		})();
	}, [currentUser?.id, messages]);

	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		setInput(transcript);
	}, [transcript]);

	return (
		<>
			{showTimer && timer!==0 && (
				<div className="absolute z-50 top-5">
					<CountdownTimer
						initialSeconds={1800 - timer}
						onCountdownEnd={() => {
							alert("TIMES UP");
							setTimeout(() => {
								navigate("/consultation");
							}, 1000);
						}}
					/>
				</div>
			)}
			<div className="w-[80vw] h-[80%] overflow-y-hidden overflow-scroll mx-auto py-2 border rounded-lg shadow-lg absolute bg-black/10">
				<div className="chat-messages h-[92%] rounded-xl p-4 w-full space-y-4 mb-4 overflow-y-scroll overflow-scroll px-2 flex flex-col">
					{messages.map((message, index) => (
						<div
							key={index}
							className={`message p-2 border rounded-lg ${
								message.type === "user"
									? "bg-teal-500 text-white self-end"
									: "bg-gray-200 text-black self-start"
							}`}
							dangerouslySetInnerHTML={{ __html: message.text }} // Use this to render HTML content
						/>
					))}
					{loading && (
						<div className="message p-2 rounded-lg bg-gray-200 text-black">
							Loading...
						</div>
					)}
					<div ref={chatEndRef} />
				</div>
				<form
					onSubmit={handleSubmit}
					className="flex absolute bottom-1 w-full px-2 gap-3">
					<Input
						borderColor={"green.500"}
						focusBorderColor="teal.500"
						type="text"
						variant={"filled"}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Type a message..."
						className="flex-grow p-2 border border-teal-700 rounded-lg"
					/>
					<Button
						type="submit"
						colorScheme={"teal"}>
						Send
					</Button>
					<Button
						variant={listening ? "solid" : "outline"}
						colorScheme={listening ? "red" : "green"}
						className="p-2 rounded-full"
						onClick={() => {
							getTranscript();
						}}>
						<FaMicrophone />
					</Button>
				</form>
			</div>
		</>
	);
};

export default Chat;
