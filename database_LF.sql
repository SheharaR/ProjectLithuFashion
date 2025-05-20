-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 20, 2025 at 06:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `news_test`
--

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `CustomerID` int(11) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tel_num` varchar(10) NOT NULL,
  `shop_name` varchar(255) DEFAULT NULL,
  `shop_address` text DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `join_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`CustomerID`, `customer_name`, `email`, `password`, `tel_num`, `shop_name`, `shop_address`, `profile_image`, `join_date`) VALUES
(3, 'Nadeeka Nimshan', 's@gmail.com', '$2b$10$TEtMcykgdbwvRInge8FyB.2./u.S9dWMy4uI8P7FgW3utvbFCN0Di', '0714032013', NULL, NULL, '1746966168970-Screenshot_2025-04-29_141556-removebg-preview.png', '2025-03-31 06:38:09'),
(4, 'Nadeeka Nimshan', 'ss@gmail.com', '$2b$10$goh.RXgHz15qXkp5gotV/Oa04ozJag6ZQoBVCf/q.pLwQ4M0rcxtK', '0785744896', 'wd', '3rd lane ,baduraliya\ndf', NULL, '2025-05-20 16:01:21');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `employee_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `join_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `employee_name`, `email`, `password`, `phone`, `join_date`) VALUES
(1, 'Nadeeka Nimshan', 's@gmail.com', '$2b$10$ng60AXrLNMszuCV6j7OJj.uiOeMDMNY4ZXPwvGHonvzLbzd/hwhQu', '0714032103', '2025-05-18 11:54:48'),
(2, 'Nadeeka Nimshan', 'w@gmail.com', '$2b$10$tvUEZKae9f7y6f6RYTrMIOqDucO46Nd7Ye8SD49se315CgAguz3nG', '123456789233', '2025-05-18 20:06:14');

-- --------------------------------------------------------

--
-- Table structure for table `employee_job_assignments`
--

CREATE TABLE `employee_job_assignments` (
  `assignment_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `completion_fraction` enum('0','1/4','1/2','3/4','full') DEFAULT '0',
  `assigned_quantity` int(11) NOT NULL,
  `completed_quantity` int(11) DEFAULT 0,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_job_assignments`
--

INSERT INTO `employee_job_assignments` (`assignment_id`, `employee_id`, `job_id`, `status`, `completion_fraction`, `assigned_quantity`, `completed_quantity`, `assigned_at`, `updated_at`) VALUES
(18, 2, 16, 'rejected', '0', 0, 0, '2025-05-18 22:30:00', '2025-05-18 22:30:00'),
(19, 2, 17, 'rejected', '0', 0, 0, '2025-05-18 22:30:08', '2025-05-18 22:30:08'),
(20, 2, 18, 'accepted', '0', 20, 15, '2025-05-18 22:37:04', '2025-05-18 22:40:36'),
(21, 2, 19, 'accepted', '0', 200, 0, '2025-05-18 22:46:58', '2025-05-18 22:48:30'),
(22, 2, 20, 'accepted', '0', 123, 0, '2025-05-18 22:51:11', '2025-05-18 23:15:36'),
(23, 2, 21, 'rejected', '0', 0, 0, '2025-05-18 22:52:02', '2025-05-18 22:52:02'),
(24, 2, 22, 'accepted', '0', 62, 62, '2025-05-19 06:12:35', '2025-05-19 06:16:24'),
(25, 1, 16, 'accepted', '0', 123, 123, '2025-05-19 06:37:37', '2025-05-19 06:43:46'),
(26, 1, 17, 'accepted', '0', 12, 12, '2025-05-19 06:44:39', '2025-05-19 06:45:07'),
(27, 1, 21, 'rejected', '0', 0, 0, '2025-05-19 06:45:28', '2025-05-19 06:45:28'),
(28, 1, 22, 'rejected', '0', 0, 0, '2025-05-19 06:45:31', '2025-05-19 06:45:31'),
(29, 1, 23, 'accepted', '0', 10, 10, '2025-05-19 06:45:42', '2025-05-19 06:45:50');

-- --------------------------------------------------------

--
-- Table structure for table `employee_salaries`
--

CREATE TABLE `employee_salaries` (
  `salary_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `total_earnings` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL,
  `deductions` decimal(10,2) DEFAULT 0.00,
  `net_salary` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

CREATE TABLE `invoice` (
  `invoice_id` int(11) NOT NULL,
  `quotation_id` bigint(20) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `payment_status` enum('Pending','Partially Paid','Paid') DEFAULT 'Pending',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice`
--

INSERT INTO `invoice` (`invoice_id`, `quotation_id`, `total_amount`, `paid_amount`, `payment_status`, `created_at`) VALUES
(1, 1747023295065, 212.00, 0.00, 'Pending', '2025-05-12 09:44:55'),
(2, 1747023385721, 212.00, 0.00, 'Pending', '2025-05-12 09:46:25');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `quotation_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `payment_status` enum('Pending','Partially Paid','Completed') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `quotation_id`, `total_amount`, `created_at`, `paid_amount`, `payment_status`) VALUES
(10, 2, 296.00, '2025-05-11 11:23:49', 296.00, 'Completed');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_item`
--

CREATE TABLE `invoice_item` (
  `item_id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `material_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice_item`
--

INSERT INTO `invoice_item` (`item_id`, `invoice_id`, `material_name`, `quantity`, `unit_price`, `created_at`) VALUES
(1, 2, 'shashika', 1, 12.00, '2025-05-12 09:46:25');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `material_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `material_name`, `quantity`, `unit_price`) VALUES
(10, 10, 'shashika', 8, 12.00);

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `job_id` int(11) NOT NULL,
  `job_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `quantity` int(11) NOT NULL,
  `remaining_quantity` int(11) NOT NULL,
  `pay_per_unit` decimal(10,2) NOT NULL,
  `design_image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`job_id`, `job_name`, `description`, `start_date`, `end_date`, `quantity`, `remaining_quantity`, `pay_per_unit`, `design_image`, `is_active`, `created_at`) VALUES
(16, 'ssd', 'sdsd', '2025-05-19', '2025-05-22', 123, 0, 123.00, '/uploads/design_image-1747606404086-866436955.jpeg', 0, '2025-05-18 22:13:24'),
(17, 'wdwd', 'dwd', '2025-05-20', '2025-05-21', 12, 0, 12.00, '/uploads/job-1747607281548.jpeg', 0, '2025-05-18 22:28:01'),
(18, 'dwd', 'wdwd', '2025-05-21', '2025-05-21', 20, 0, 200.00, '/uploads/job-1747607808996.jpeg', 0, '2025-05-18 22:36:48'),
(19, 'dwdw', 'dwd', '2025-05-19', '2025-05-20', 200, 0, 200.00, NULL, 0, '2025-05-18 22:44:12'),
(20, 'sqs', 'qsqs', '2025-05-19', '2025-05-22', 123, 0, 123.00, NULL, 0, '2025-05-18 22:51:05'),
(21, 'sqs', 'sqs', '2025-05-19', '2025-05-20', 123, 123, 123.00, '/uploads/job-1747608692710.jpeg', 1, '2025-05-18 22:51:32'),
(22, 'dsd', 'qsqs', '2025-05-28', '2025-05-30', 123, 61, 122.99, '/uploads/job-1747635144486.jpeg', 1, '2025-05-19 06:12:24'),
(23, 'wdwd', 'dwd', '2025-05-19', '2025-05-29', 10, 0, 10.00, '/uploads/job-1747636627867.jpeg', 0, '2025-05-19 06:37:07');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_method` enum('full','advance') NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `shipping_address` text DEFAULT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `current_status` enum('processing','completed','delivered','cancelled') DEFAULT 'processing',
  `delivery_date` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `customer_id`, `order_date`, `total_amount`, `payment_status`, `payment_method`, `amount_paid`, `shipping_address`, `contact_number`, `current_status`, `delivery_date`) VALUES
(4, 3, '2025-05-18 10:27:17', 24.00, 'paid', 'full', 24.00, NULL, NULL, 'completed', '2025-05-18'),
(5, 3, '2025-05-18 10:27:45', 24.00, 'paid', 'full', 24.00, NULL, NULL, 'completed', '2025-05-18'),
(6, 3, '2025-05-19 03:06:28', 12.00, 'paid', 'full', 12.00, NULL, NULL, 'delivered', '2025-05-19'),
(7, 3, '2025-05-19 06:48:04', 48.00, 'paid', 'full', 48.00, NULL, NULL, 'completed', '2025-05-19');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `order_id`, `product_id`, `quantity`, `unit_price`) VALUES
(4, 4, 'w12', 1, 12.00),
(5, 4, 'A001', 1, 12.00),
(6, 5, 'A001', 2, 12.00),
(7, 6, 'w12', 1, 12.00),
(8, 7, 'A001', 4, 12.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `name`, `category`, `price`, `stock`, `description`, `created_at`) VALUES
('A001', 'shashika', 'Lunch', 12.00, 0, 'dd', '2025-05-09 09:27:45'),
('w12', 'shashika', 'Teddy Bears & Soft Toys', 20.00, 3, 'sss', '2025-05-09 09:11:36');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` varchar(100) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `file_name`, `file_type`, `file_path`, `uploaded_at`) VALUES
(3, 'w12', '1746781896821-productImage.png', 'image/png', 'uploads\\1746781896821-productImage.png', '2025-05-09 09:11:36'),
(4, 'A001', '1746782865578-productImage.jpg', 'image/jpeg', 'uploads\\1746782865578-productImage.jpg', '2025-05-09 09:27:45');

-- --------------------------------------------------------

--
-- Table structure for table `salaries`
--

CREATE TABLE `salaries` (
  `salary_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `month` int(2) NOT NULL,
  `year` int(4) NOT NULL,
  `base_salary` decimal(10,2) NOT NULL,
  `bonus` decimal(10,2) DEFAULT 0.00,
  `total_salary` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salaries`
--

INSERT INTO `salaries` (`salary_id`, `employee_id`, `month`, `year`, `base_salary`, `bonus`, `total_salary`, `created_at`) VALUES
(5, 2, 5, 2025, 10625.38, 2050.00, 12675.38, '2025-05-19 09:27:00'),
(6, 1, 5, 2025, 15373.00, 2052.00, 17425.00, '2025-05-19 09:27:08');

-- --------------------------------------------------------

--
-- Table structure for table `salary_details`
--

CREATE TABLE `salary_details` (
  `detail_id` int(11) NOT NULL,
  `salary_id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `pay_per_unit` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salary_details`
--

INSERT INTO `salary_details` (`detail_id`, `salary_id`, `job_id`, `quantity`, `pay_per_unit`, `subtotal`) VALUES
(12, 5, 18, 15, 200.00, 3000.00),
(13, 5, 22, 62, 122.99, 7625.38),
(14, 6, 16, 123, 123.00, 15129.00),
(15, 6, 17, 12, 12.00, 144.00),
(16, 6, 23, 10, 10.00, 100.00);

-- --------------------------------------------------------

--
-- Table structure for table `supervisors`
--

CREATE TABLE `supervisors` (
  `SupervisorID` int(11) NOT NULL,
  `supervisor_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tel_num` varchar(10) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `nickname` varchar(100) NOT NULL,
  `nic` varchar(12) NOT NULL,
  `join_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supervisors`
--

INSERT INTO `supervisors` (`SupervisorID`, `supervisor_name`, `email`, `password`, `tel_num`, `profile_image`, `nickname`, `nic`, `join_date`) VALUES
(2, 'Nadeeka Nimshan', 's@gmail.com', '$2b$10$4OjENHvVVUiYZTn7aDSX9OQvg1EA3/vizFEjIdRIZv3mm4Txptjlm', '0714032013', NULL, 'nadeeka_nimshan2634', '199923601557', '2025-03-31 06:37:41');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`CustomerID`),
  ADD KEY `email` (`email`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `employee_job_assignments`
--
ALTER TABLE `employee_job_assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`,`job_id`),
  ADD KEY `job_id` (`job_id`);

--
-- Indexes for table `employee_salaries`
--
ALTER TABLE `employee_salaries`
  ADD PRIMARY KEY (`salary_id`),
  ADD UNIQUE KEY `unique_employee_month_year` (`employee_id`,`month`,`year`);

--
-- Indexes for table `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`invoice_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_invoice_order` (`quotation_id`);

--
-- Indexes for table `invoice_item`
--
ALTER TABLE `invoice_item`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_invoice_items` (`invoice_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`job_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `salaries`
--
ALTER TABLE `salaries`
  ADD PRIMARY KEY (`salary_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `salary_details`
--
ALTER TABLE `salary_details`
  ADD PRIMARY KEY (`detail_id`),
  ADD KEY `salary_id` (`salary_id`),
  ADD KEY `job_id` (`job_id`);

--
-- Indexes for table `supervisors`
--
ALTER TABLE `supervisors`
  ADD PRIMARY KEY (`SupervisorID`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `nickname` (`nickname`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `CustomerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `employee_job_assignments`
--
ALTER TABLE `employee_job_assignments`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `employee_salaries`
--
ALTER TABLE `employee_salaries`
  MODIFY `salary_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice`
--
ALTER TABLE `invoice`
  MODIFY `invoice_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `invoice_item`
--
ALTER TABLE `invoice_item`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `job_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `salaries`
--
ALTER TABLE `salaries`
  MODIFY `salary_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `salary_details`
--
ALTER TABLE `salary_details`
  MODIFY `detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `supervisors`
--
ALTER TABLE `supervisors`
  MODIFY `SupervisorID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `employee_job_assignments`
--
ALTER TABLE `employee_job_assignments`
  ADD CONSTRAINT `employee_job_assignments_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `employee_job_assignments_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`job_id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_salaries`
--
ALTER TABLE `employee_salaries`
  ADD CONSTRAINT `employee_salaries_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `invoice_item`
--
ALTER TABLE `invoice_item`
  ADD CONSTRAINT `invoice_item_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`invoice_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
