import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../../data/ai-forum.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    nickname TEXT NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT DEFAULT '/default-avatar.png',
    bio TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT '📚'
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    author_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    collects_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    parent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id)
  );

  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
  );

  CREATE TABLE IF NOT EXISTS collects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
  );

  CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
  CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
  CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
  CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
  CREATE INDEX IF NOT EXISTS idx_collects_user ON collects(user_id);
`)

const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }
if (categoryCount.count === 0) {
  const insertCategory = db.prepare('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)')
  const categories = [
    ['机器学习', 'machine-learning', '🤖'],
    ['深度学习', 'deep-learning', '🧠'],
    ['自然语言处理', 'nlp', '💬'],
    ['计算机视觉', 'cv', '👁️'],
    ['AI工具与框架', 'tools', '🔧'],
    ['AI伦理与前沿', 'ethics', '⚖️'],
    ['技术问答', 'qa', '❓'],
  ]
  categories.forEach(cat => insertCategory.run(...cat))
}

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync('admin123', 10)
  const insertUser = db.prepare('INSERT INTO users (email, nickname, password, bio) VALUES (?, ?, ?, ?)')
  insertUser.run('admin@ai-forum.com', 'AI管理员', hashedPassword, 'AI论坛管理员，欢迎大家交流学习！')
  
  const insertPost = db.prepare(`
    INSERT INTO posts (title, content, summary, author_id, category_id, likes_count, comments_count)
    VALUES (?, ?, ?, 1, ?, ?, ?)
  `)
  
  insertPost.run(
    'Transformer架构详解：从注意力机制到BERT',
    '# Transformer架构详解\n\n## 前言\n\nTransformer是一种基于注意力机制（Attention Mechanism）的神经网络架构，由Google在2017年的论文《Attention Is All You Need》中提出。它彻底改变了自然语言处理（NLP）领域，并在各种任务中取得了突破性成果。\n\n## 核心组件\n\n### 1. 自注意力机制（Self-Attention）\n\n自注意力机制是Transformer的核心。它允许模型在处理序列数据时，能够关注到序列中的任意位置。\n\n自注意力的计算过程：\n- 输入通过三个线性变换得到Q（Query）、K（Key）、V（Value）\n- 计算注意力分数：Attention(Q,K,V) = softmax(QK^T/d_k)V\n- 这允许模型在处理当前位置时，考虑到序列中的所有其他位置\n\n### 2. 多头注意力（Multi-Head Attention）\n\n将注意力机制并行运行多次，捕获不同类型的依赖关系。每个头学习不同的注意力模式。\n\n### 3. 位置编码（Positional Encoding）\n\n由于Transformer没有循环结构，需要添加位置信息。使用正弦和余弦函数来编码位置。\n\n## 总结\n\nTransformer的成功证明了注意力机制的有效性，为后续GPT、BERT等模型奠定了基础。',
    '深入解析Transformer架构的核心原理，包括自注意力机制、多头注意力和位置编码等关键组件。',
    2,
    42,
    15
  )
  
  insertPost.run(
    'PyTorch实战：构建你的第一个神经网络',
    '# PyTorch实战指南\n\n## 环境准备\n\n首先，确保安装了PyTorch：\n\n```\npip install torch torchvision\n```\n\n## 简单神经网络示例\n\n让我们用PyTorch构建一个简单的手写数字识别网络：\n\n```python\nimport torch\nimport torch.nn as nn\nimport torch.optim as optim\n\nclass SimpleNN(nn.Module):\n    def __init__(self):\n        super(SimpleNN, self).__init__()\n        self.layer1 = nn.Linear(784, 256)\n        self.layer2 = nn.Linear(256, 128)\n        self.layer3 = nn.Linear(128, 10)\n        self.relu = nn.ReLU()\n        self.dropout = nn.Dropout(0.2)\n    \n    def forward(self, x):\n        x = x.view(-1, 784)\n        x = self.relu(self.layer1(x))\n        x = self.dropout(x)\n        x = self.relu(self.layer2(x))\n        x = self.dropout(x)\n        x = self.layer3(x)\n        return x\n\nmodel = SimpleNN()\ncriterion = nn.CrossEntropyLoss()\noptimizer = optim.Adam(model.parameters(), lr=0.001)\n```\n\n## 训练循环\n\n定义训练函数并执行训练。通过多个epoch迭代优化模型参数。\n\n## 结论\n\n通过本教程，你已经学会了如何使用PyTorch构建和训练神经网络。继续探索更多高级主题吧！',
    '使用PyTorch构建简单神经网络，包括模型定义、训练循环和优化策略。',
    1,
    38,
    12
  )
  
  insertPost.run(
    '深入理解GPT-4的工作原理',
    '# GPT-4技术解析\n\n## 概述\n\nGPT-4是OpenAI最新的大型语言模型，相比GPT-3有了质的飞跃。本文将深入解析其工作原理。\n\n## 关键创新\n\n### 1. 多模态能力\n\nGPT-4能够处理文本和图像输入，这是一个重大突破。它可以理解和分析图片内容，并基于此进行对话和创作。\n\n### 2. 改进的推理能力\n\n通过大规模强化学习和人类反馈（RLHF），GPT-4展现出更强的推理能力。它能够进行更复杂的逻辑推理和问题解决。\n\n### 3. 更长的上下文\n\nGPT-4支持更长的上下文窗口，最多可达32,768个tokens，使得它能够处理更长的文档和对话。\n\n## 技术架构\n\nGPT-4仍然基于Transformer架构，但进行了多项优化：\n\n- **更深的网络**：更多的层数和参数\n- **改进的注意力机制**：更高效的长序列处理\n- **优化的训练数据**：更高质量的训练语料\n\n## 应用场景\n\n1. 智能客服\n2. 内容创作\n3. 代码辅助\n4. 教育辅导\n\n## 未来展望\n\n大型语言模型的发展日新月异，我们期待更多创新！',
    '深入解析GPT-4的工作原理，包括多模态能力、改进的推理能力和技术架构。',
    3,
    56,
    28
  )
  
  insertPost.run(
    'YOLO目标检测实战：从入门到精通',
    '# YOLO目标检测实战\n\n## YOLO简介\n\nYOLO（You Only Look Once）是一种实时目标检测系统，以其速度和准确性著称。\n\n## 版本演进\n\n- YOLOv1：开创性工作\n- YOLOv3：Darknet-53骨干网络\n- YOLOv5：Ultralytics实现\n- YOLOv8：最新版本\n\n## 代码实战\n\n```python\nfrom ultralytics import YOLO\n\nmodel = YOLO(\'yolov8n.pt\')\n\nresults = model.train(\n    data=\'coco.yaml\',\n    epochs=100,\n    imgsz=640,\n    device=\'cuda\'\n)\n\nresults = model.predict(source=\'image.jpg\')\n```\n\n## 训练自己的数据集\n\n1. 准备标注数据（使用LabelImg）\n2. 转换为YOLO格式\n3. 编写数据配置文件\n4. 开始训练\n\n## 性能优化\n\n- 使用预训练权重\n- 调整图像尺寸\n- 数据增强\n- 模型剪枝',
    'YOLO目标检测实战教程，涵盖从环境配置到模型训练的完整流程。',
    4,
    29,
    8
  )
  
  insertPost.run(
    'LangChain入门：用大模型构建应用',
    '# LangChain实战指南\n\n## 什么是LangChain？\n\nLangChain是一个用于构建大语言模型应用的框架，提供了丰富的工具和组件。\n\n## 核心概念\n\n### 1. Chains\n\n将多个LLM调用串联起来：\n\n```python\nfrom langchain import LLMChain, PromptTemplate\nfrom langchain.llms import OpenAI\n\nllm = OpenAI(temperature=0.9)\nprompt = PromptTemplate(\n    input_variables=["product"],\n    template="为{product}写一个创意广告语："\n)\nchain = LLMChain(llm=llm, prompt=prompt)\nprint(chain.run("AI产品"))\n```\n\n### 2. Agents\n\n让模型自主决策和执行操作。通过工具绑定，模型可以搜索网页、进行计算等。\n\n### 3. Memory\n\n为对话添加记忆功能，使聊天机器人能够记住之前的对话内容。\n\n## 实战项目\n\n使用LangChain构建一个本地知识库问答系统，支持文档上传和智能问答。',
    'LangChain入门教程，学习如何使用LangChain构建大语言模型应用。',
    5,
    45,
    20
  )
  
  const insertComment = db.prepare(`
    INSERT INTO comments (content, author_id, post_id, parent_id)
    VALUES (?, 1, ?, ?)
  `)
  
  insertComment.run('非常详细的教程！', 1, null)
  insertComment.run('谢谢分享，期待后续内容！', 2, null)
  insertComment.run('请问有源码吗？', 3, null)
  insertComment.run('源码链接已添加到文章末尾', 1, 3)
}

export default db
