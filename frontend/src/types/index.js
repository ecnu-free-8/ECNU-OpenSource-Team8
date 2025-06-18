// 数据类型定义

/**
 * 交易记录类型
 * @typedef {Object} Transaction
 * @property {number} id - 交易ID
 * @property {string} description - 交易描述
 * @property {number} amount - 交易金额（正数为收入，负数为支出）
 * @property {string} category - 交易分类
 * @property {string} date - 交易日期 (YYYY-MM-DD)
 * @property {string} time - 交易时间显示文本
 * @property {'income'|'expense'} type - 交易类型
 * @property {string} [note] - 备注
 */

/**
 * 财务摘要类型
 * @typedef {Object} FinancialSummary
 * @property {number} monthlyIncome - 本月收入
 * @property {number} monthlyExpense - 本月支出
 * @property {number} monthlyBalance - 本月结余
 * @property {number} [yearlyIncome] - 年度收入
 * @property {number} [yearlyExpense] - 年度支出
 */

/**
 * 分类类型
 * @typedef {Object} Category
 * @property {number} id - 分类ID
 * @property {string} name - 分类名称
 * @property {string} icon - 分类图标
 * @property {string} color - 分类颜色
 * @property {'income'|'expense'|'both'} type - 分类适用类型
 */

/**
 * 预算计划类型
 * @typedef {Object} Budget
 * @property {number} id - 预算ID
 * @property {string} name - 预算名称
 * @property {string} category - 关联分类
 * @property {number} targetAmount - 目标金额
 * @property {number} currentAmount - 当前金额
 * @property {'monthly'|'yearly'|'saving'} type - 预算类型
 * @property {string} icon - 预算图标
 * @property {string} startDate - 开始日期
 * @property {string} endDate - 结束日期
 */

/**
 * 支出报表数据类型
 * @typedef {Object} ReportData
 * @property {string} title - 报表标题
 * @property {Array<CategoryAmount>} categories - 分类金额数据
 * @property {number} totalAmount - 总金额
 * @property {string} period - 时间周期
 */

/**
 * 分类金额类型
 * @typedef {Object} CategoryAmount
 * @property {string} name - 分类名称
 * @property {number} amount - 金额
 * @property {string} icon - 图标
 * @property {string} color - 颜色
 * @property {number} percentage - 占比百分比
 */

/**
 * API响应类型
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 请求是否成功
 * @property {any} data - 响应数据
 * @property {string} [message] - 响应消息
 * @property {number} [code] - 响应代码
 */

/**
 * 分页参数类型
 * @typedef {Object} PaginationParams
 * @property {number} page - 页码
 * @property {number} limit - 每页数量
 * @property {string} [sortBy] - 排序字段
 * @property {'asc'|'desc'} [sortOrder] - 排序方向
 */

/**
 * 查询参数类型
 * @typedef {Object} QueryParams
 * @property {string} [startDate] - 开始日期
 * @property {string} [endDate] - 结束日期
 * @property {string} [category] - 分类筛选
 * @property {'income'|'expense'} [type] - 类型筛选
 * @property {string} [keyword] - 关键词搜索
 */

export {};
