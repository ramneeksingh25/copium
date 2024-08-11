import { Button, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { MdDashboard } from "react-icons/md";
import { useUser } from "../contexts/userContext";
import { FaUserDoctor } from "react-icons/fa6";

const Home = () => {
	const navigate = useNavigate();
	const {user} = useUser();
	return (
		<div className="relative w-full h-full px-[5vw] flex items-center">
			<div
				className="text-center sm:text-center md:text-left lg:text-left w-full lg:w-1/2
				md:w-1/2 sm:w-full flex flex-col items-center sm:items-center md:items-start lg:items-start">
				<span className=" font-poppins text-center sm:text-center md:text-left lg:text-left">
					<h1 className="text-5xl font-semibold text-cyan-800">
						Healthy
						<TypeAnimation
							sequence={[" Insights", 1000, " Decisions", 1000]}
							className="text-teal-500"
							repeat={Infinity}
							speed={80}
							deletionSpeed={300}
						/>
					</h1>
				</span>
				<div className="text-xl w-full mt-3 text-center sm:text-center md:text-left lg:text-left">
					We help in pioneering the future of healthcare with cutting-edge
					telehealth and telemedicine solution
					<Flex
						gap={`1vw`}
						alignItems={"center"}
						justifyContent={"center"}>
						{user ? (
							<>
								<Button
									colorScheme="teal"
									rightIcon={<FaUserDoctor />}
									className="mt-3"
									onClick={()=>{
										navigate("/consultation");
									}}
									>
									Start Consultation
								</Button>
							</>
						) : (
							<>
								<Button
									colorScheme="teal"
									rightIcon={<MdDashboard />}
									className="mt-3"
									onClick={() => {
										navigate("/signin");
									}}>
									Sign In to start Consultation
								</Button>
							</>
						)}
					</Flex>
				</div>
			</div>
			<img
				src="/MockUp.png"
				alt="stock-image"
				className="hidden sm:hidden md:block lg:block absolute right-0 bottom-0 w-[40%]"
			/>
			
		</div>
	);
};

export default Home;
