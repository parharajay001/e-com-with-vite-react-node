-- AlterTable
ALTER TABLE `product_category` ADD COLUMN `image_url` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `banner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NULL,
    `position` ENUM('HOME_TOP', 'HOME_MIDDLE', 'HOME_BOTTOM', 'CATEGORY_PAGE', 'PRODUCT_PAGE', 'CHECKOUT_PAGE') NOT NULL DEFAULT 'HOME_TOP',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SCHEDULED') NOT NULL DEFAULT 'ACTIVE',
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `clicks` INTEGER NOT NULL DEFAULT 0,
    `impressions` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modified_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `banner_status_start_date_end_date_idx`(`status`, `start_date`, `end_date`),
    INDEX `banner_position_priority_idx`(`position`, `priority`),
    INDEX `banner_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
