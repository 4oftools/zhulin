package com.zhulin.bootstrap;

import com.zhulin.model.*;
import com.zhulin.repository.BambooForestRepository;
import com.zhulin.repository.DailyReviewRepository;
import com.zhulin.repository.SprintRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 在空库时插入演示数据。通过 {@code zhulin.demo-data=false} 关闭。
 */
@Component
@Order(100)
@ConditionalOnProperty(prefix = "zhulin", name = "demo-data", havingValue = "true")
public class DemoDataLoader implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataLoader.class);

    private final BambooForestRepository forestRepository;
    private final SprintRepository sprintRepository;
    private final DailyReviewRepository dailyReviewRepository;

    public DemoDataLoader(
            BambooForestRepository forestRepository,
            SprintRepository sprintRepository,
            DailyReviewRepository dailyReviewRepository) {
        this.forestRepository = forestRepository;
        this.sprintRepository = sprintRepository;
        this.dailyReviewRepository = dailyReviewRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (forestRepository.count() > 0) {
            log.debug("跳过演示数据：库中已有竹林");
            return;
        }

        LocalDateTime qStart = LocalDateTime.of(2026, 1, 1, 0, 0);
        LocalDateTime qEnd = LocalDateTime.of(2026, 6, 30, 23, 59, 59);

        BambooForest forest = new BambooForest();
        forest.setId("demo-forest-zhulin");
        forest.setName("竹林工作法 · 演示");
        forest.setDescription("用于联调与展示的示例竹林，可安全删除后自建数据。");
        forest.setStartDate(qStart);
        forest.setEndDate(qEnd);
        forest.setEnabled(true);
        forest.setArchived(false);

        BambooField fieldA = new BambooField();
        fieldA.setId("demo-field-product");
        fieldA.setForestId(forest.getId());
        fieldA.setForest(forest);
        fieldA.setName("产品竹田");
        fieldA.setDescription("迭代与发布相关竹子");
        fieldA.setStartDate(qStart);
        fieldA.setEndDate(qEnd);
        fieldA.setSortOrder(0);
        fieldA.setArchived(false);

        BambooField fieldB = new BambooField();
        fieldB.setId("demo-field-engineering");
        fieldB.setForestId(forest.getId());
        fieldB.setForest(forest);
        fieldB.setName("工程竹田");
        fieldB.setDescription("研发与质量相关竹子");
        fieldB.setStartDate(qStart);
        fieldB.setEndDate(qEnd);
        fieldB.setSortOrder(1);
        fieldB.setArchived(false);

        forest.getBambooFields().add(fieldA);
        forest.getBambooFields().add(fieldB);

        Bamboo bamboo1 = new Bamboo();
        bamboo1.setId("demo-bamboo-release");
        bamboo1.setFieldId(fieldA.getId());
        bamboo1.setField(fieldA);
        bamboo1.setName("移动端 2.0 发布");
        bamboo1.setDescription("含商店审核与灰度");
        bamboo1.setStartDate(LocalDateTime.of(2026, 2, 1, 0, 0));
        bamboo1.setEndDate(LocalDateTime.of(2026, 3, 31, 0, 0));
        bamboo1.setCompleted(false);
        bamboo1.setInActivityList(true);
        fieldA.getBamboos().add(bamboo1);

        BambooSection t1 = section("demo-task-ui", "UI 走查与修正", BambooSectionStatus.IN_PROGRESS, false, true);
        BambooSection t2 = section("demo-task-api", "核心 API 联调", BambooSectionStatus.PENDING, false, true);
        BambooSection t3 = section("demo-task-store", "应用商店物料", BambooSectionStatus.PENDING, false, false);
        t1.getTags().addAll(List.of("设计", "高优"));
        t2.getTags().addAll(List.of("后端"));
        for (BambooSection t : List.of(t1, t2, t3)) {
            t.setBambooId(bamboo1.getId());
            bamboo1.getTasks().add(t);
        }

        Bamboo bamboo2 = new Bamboo();
        bamboo2.setId("demo-bamboo-docs");
        bamboo2.setFieldId(fieldA.getId());
        bamboo2.setField(fieldA);
        bamboo2.setName("帮助中心改版");
        bamboo2.setDescription("文档站信息架构");
        bamboo2.setStartDate(LocalDateTime.of(2026, 2, 15, 0, 0));
        bamboo2.setEndDate(LocalDateTime.of(2026, 4, 15, 0, 0));
        bamboo2.setCompleted(false);
        bamboo2.setInActivityList(false);
        fieldA.getBamboos().add(bamboo2);

        BambooSection t4 = section("demo-task-ia", "信息架构草案", BambooSectionStatus.COMPLETED, true, false);
        t4.setBambooId(bamboo2.getId());
        t4.setCompletedAt(LocalDateTime.of(2026, 2, 20, 17, 0));
        bamboo2.getTasks().add(t4);

        Bamboo bamboo3 = new Bamboo();
        bamboo3.setId("demo-bamboo-ci");
        bamboo3.setFieldId(fieldB.getId());
        bamboo3.setField(fieldB);
        bamboo3.setName("CI 流水线加固");
        bamboo3.setDescription("单测覆盖率与缓存策略");
        bamboo3.setStartDate(LocalDateTime.of(2026, 1, 10, 0, 0));
        bamboo3.setEndDate(LocalDateTime.of(2026, 3, 1, 0, 0));
        bamboo3.setCompleted(false);
        bamboo3.setInActivityList(true);
        fieldB.getBamboos().add(bamboo3);

        BambooSection t5 = section("demo-task-coverage", "覆盖率门禁", BambooSectionStatus.IN_PROGRESS, false, true);
        t5.setBambooId(bamboo3.getId());
        bamboo3.getTasks().add(t5);

        Goal goal = new Goal();
        goal.setId("demo-goal-q1");
        goal.setForestId(forest.getId());
        goal.setForest(forest);
        goal.setName("Q1 留存提升 5%");
        goal.setDescription("围绕新用户首周体验做实验与迭代");
        goal.setCompleted(false);
        forest.getGoals().add(goal);

        KeyOutput ko = new KeyOutput();
        ko.setId("demo-ko-onboarding");
        ko.setForestId(forest.getId());
        ko.setForest(forest);
        ko.setName("新手引导方案定稿");
        ko.setDescription("含三步引导与可跳过策略");
        ko.setCompleted(false);
        forest.getKeyOutputs().add(ko);

        Learning learning = new Learning();
        learning.setId("demo-learning-retro");
        learning.setForestId(forest.getId());
        learning.setForest(forest);
        learning.setTitle("迭代回顾：范围控制");
        learning.setContent("本次迭代因并行需求过多导致测试压缩，下次需上限 WIP。");
        learning.setCategory("流程");
        learning.getTags().addAll(List.of("回顾", "WIP"));
        forest.getLearnings().add(learning);

        forestRepository.save(forest);

        LocalDateTime st1 = LocalDateTime.of(2026, 3, 26, 9, 30, 0);
        Sprint sprint1 = new Sprint();
        sprint1.setId("demo-sprint-1");
        sprint1.setTaskId("demo-task-ui");
        sprint1.setTaskName("UI 走查与修正");
        sprint1.setStartTime(st1);
        sprint1.setEndTime(st1.plusMinutes(25));
        sprint1.setDuration(25 * 60L);
        sprint1.setStatus(SprintStatus.COMPLETED);
        sprint1.setType(SprintType.SPRINT);

        LocalDateTime st2 = LocalDateTime.of(2026, 3, 26, 14, 0, 0);
        Sprint sprint2 = new Sprint();
        sprint2.setId("demo-sprint-2");
        sprint2.setTaskName("休息");
        sprint2.setStartTime(st2);
        sprint2.setEndTime(st2.plusMinutes(5));
        sprint2.setDuration(5 * 60L);
        sprint2.setStatus(SprintStatus.COMPLETED);
        sprint2.setType(SprintType.REST);

        sprintRepository.saveAll(List.of(sprint1, sprint2));

        DailyReview r1 = new DailyReview();
        r1.setId("demo-review-1");
        r1.setDate(LocalDate.of(2026, 3, 25));
        r1.setScore(8);
        r1.setGoodThings("演示数据一次加载成功；与后端字段对齐。");
        r1.setBadThings("晚上咖啡喝多了。");

        DailyReview r2 = new DailyReview();
        r2.setId("demo-review-2");
        r2.setDate(LocalDate.of(2026, 3, 26));
        r2.setScore(7);
        r2.setGoodThings("冲刺列表与日历筛选正常。");
        r2.setBadThings("待办略多，需要再排优先级。");

        dailyReviewRepository.saveAll(List.of(r1, r2));

        log.info("已写入演示数据：竹林 1、竹田 2、竹子 3、竹节 5、目标/关键产出/学习各 1、冲刺 2、回顾 2");
    }

    private static BambooSection section(
            String id,
            String name,
            BambooSectionStatus status,
            boolean completed,
            boolean inTodoList) {
        BambooSection s = new BambooSection();
        s.setId(id);
        s.setName(name);
        s.setType(BambooSectionType.REGULAR);
        s.setStatus(status);
        s.setCompleted(completed);
        s.setInTodoList(inTodoList);
        s.setPriority(1);
        s.setDescription("");
        return s;
    }
}
