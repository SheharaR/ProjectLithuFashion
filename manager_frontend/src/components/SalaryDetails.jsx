import { Button, Card, Descriptions, Table, message } from 'antd';
import React, { useEffect, useState } from 'react';

import autoTable from 'jspdf-autotable';
import axios from 'axios';
import jsPDF from 'jspdf';
import moment from 'moment';
import { useParams } from 'react-router-dom';

const SalaryDetails = () => {
    const [salary, setSalary] = useState(null);
    const [details, setDetails] = useState([]);
    const { salary_id } = useParams();

    const fetchSalaryDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/salaries/${salary_id}`);
            setSalary(response.data);
            setDetails(response.data.details);
        } catch (error) {
            message.error('Failed to fetch salary details');
        }
    };

    useEffect(() => {
        fetchSalaryDetails();
    }, [salary_id]);

    const downloadPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Payment Slip', 14, 15);

        doc.setFontSize(12);
        doc.text(`Employee: ${salary.employee_name}`, 14, 30);
        doc.text(`Email: ${salary.email}`, 14, 38);
        doc.text(`Period: ${salary.month}/${salary.year}`, 14, 46);
        doc.text(`Base Salary: LKR ${salary.base_salary.toFixed(2)}`, 14, 54);
        doc.text(`Bonus: LKR ${salary.bonus.toFixed(2)}`, 14, 62);
        doc.text(`Total Salary: LKR ${salary.total_salary.toFixed(2)}`, 14, 70);
        doc.text(`Created At: ${moment(salary.created_at).format('YYYY-MM-DD HH:mm')}`, 14, 78);

        autoTable(doc, {
            startY: 90,
            head: [['Job Name', 'Quantity', 'Pay Per Unit (LKR)', 'Subtotal (LKR)']],
            body: details.map(item => [
                item.job_name,
                item.quantity,
                item.pay_per_unit.toFixed(2),
                item.subtotal.toFixed(2)
            ]),
        });

        doc.save(`SalarySlip_${salary.employee_name}_${salary.month}_${salary.year}.pdf`);
    };

    if (!salary) return <div>Loading...</div>;

    const detailColumns = [
        {
            title: 'Job Name',
            dataIndex: 'job_name',
            key: 'job_name',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Pay Per Unit (LKR)',
            dataIndex: 'pay_per_unit',
            key: 'pay_per_unit',
            render: (value) => `LKR ${value.toFixed(2)}`
        },
        {
            title: 'Subtotal (LKR)',
            dataIndex: 'subtotal',
            key: 'subtotal',
            render: (value) => `LKR ${value.toFixed(2)}`
        },
    ];

    return (
        <div>
            <Card 
                title="Salary Summary" 
                style={{ marginBottom: 20 }}
                extra={<Button type="primary" onClick={downloadPDF}>Download Payment Slip (PDF)</Button>}
            >
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Employee">{salary.employee_name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{salary.email}</Descriptions.Item>
                    <Descriptions.Item label="Period">{salary.month}/{salary.year}</Descriptions.Item>
                    <Descriptions.Item label="Base Salary">LKR {salary.base_salary.toFixed(2)}</Descriptions.Item>
                    <Descriptions.Item label="Bonus">LKR {salary.bonus.toFixed(2)}</Descriptions.Item>
                    <Descriptions.Item label="Total Salary">LKR {salary.total_salary.toFixed(2)}</Descriptions.Item>
                    <Descriptions.Item label="Created At">
                        {moment(salary.created_at).format('YYYY-MM-DD HH:mm')}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <h2>Job Details</h2>
            <Table 
                columns={detailColumns} 
                dataSource={details} 
                rowKey="detail_id" 
                pagination={false}
            />
        </div>
    );
};

export default SalaryDetails;
