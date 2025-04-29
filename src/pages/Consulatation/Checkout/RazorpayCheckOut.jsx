/* eslint-disable react/prop-types */
import { Button } from '@chakra-ui/react';
import { useUser } from '../../../contexts/userContext';
import { useNavigate } from 'react-router-dom';
import {doc, updateDoc} from 'firebase/firestore'
import { db } from "../../../config/firebase";


const RazorpayCheckout = ({filled,paymentFunction}) => {
  const {user}=useUser();
  const nav = useNavigate();
  const handlePayment = () => {
    const options = {
      key: 'rzp_test_Ggtb7A6laiF7l7', 
      amount: '20000', 
      currency: 'INR',
      name: 'Teleheath',
      description: 'Test Transaction',
      handler: function (response) {
        console.log(`Payment successful: ${response.razorpay}`);
        paymentFunction(true);

        const userRef = doc(db,"Users",user.id);
        const paymentTimestamp = new Date();
        (async()=>{
          console.log(paymentTimestamp.toString());
          await updateDoc(userRef, {
            paymentTimestamp: paymentTimestamp.toString(),
            paymentDone: true,
          });
        })();
        nav("/chat")
        
      },
      prefill: {
        name: user?.displayName,
        email: user?.email
      },
      theme: {
        color: '#9EEAE4'
      }
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <>
      <Button type='submit' variant={'solid'} width={'100%'} colorScheme='teal' onClick={()=>{
        if (filled) {
          handlePayment()
        }
        }}>Submit and Pay Fee</Button>
    </>
  );
};

export default RazorpayCheckout;
