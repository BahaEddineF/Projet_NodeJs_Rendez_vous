import React, { useState } from "react";
import styled from "styled-components"; // Import de styled-components

const Modal = styled.div`
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
`;

const CloseButton = styled.span`
    cursor: pointer;
    font-size: 24px;
    font-weight: bold;
    position: absolute;
    right: 15px;
    top: 10px;
`;

const Button = styled.button`
    padding: 10px 15px;
    font-size: 20px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    &:hover {
        background-color: #0056b3;
    }
`;

const AppointmentList = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <div>
            <Button onClick={() => setShowModal(true)}>+</Button>

            {showModal && (
                <Modal>
                    <ModalContent>
                        <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
                        <h2>Modal affichée ✅</h2>
                    </ModalContent>
                </Modal>
            )}
        </div>
    );
};

export default AppointmentList;
